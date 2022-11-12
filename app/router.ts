/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import fastifyStatic from "@fastify/static";
import {
	FastifyPluginCallback,
	FastifyReply,
	FastifyRequest
} from "fastify";
import { readFileSync } from "fs";
import glob from "glob";
import { parseAcceptLanguage } from "intl-parse-accept-language";
import { resolve } from "path";
import { cloneElement, createElement } from "preact";
import { renderToString } from "preact-render-to-string";
import { URL } from "url";
import { addMPLLicenseHeader } from "./utils/html";

export const mediaRouter: FastifyPluginCallback = (
	server,
	opts,
	done
) => {
	return fastifyStatic(
		server,
		{
			...opts,
			root: resolve(process.cwd(), ".scalar", "public"),
			prefix: "/"
		},
		done
	);
};

export const router: FastifyPluginCallback = async (
	server,
	opts,
	done
) => {
	server.register(mediaRouter, { prefix: "/" });

	const routes = glob.sync(
		resolve(process.cwd(), "app", "pages", "**", "*.tsx"),
		{ nodir: true }
	);

	const pagesBuildDir = resolve(process.cwd(), ".scalar", "pages");

	const windowsPrefix =
		process.platform == "win32" ? "file:///" : "";

	const Layout = (
		(await import(
			windowsPrefix + resolve(pagesBuildDir, "@layout.js")
		)) as any
	).default.default;

	const errorHandlers = new Map<number, any>();

	const serverErrHandler = (
		statusCode: number,
		req: FastifyRequest,
		res: FastifyReply
	) => {
		try {
			const handler = errorHandlers.get(statusCode);

			res.status(statusCode);

			return handler(req, res);
		} catch (e) {
			let locale =
				parseAcceptLanguage(
					req.headers["accept-language"]
				)[0].split("-")[0] || "";

			if (locale.startsWith("en")) {
				locale = "";
			}

			return res
				.status(500)
				.header("content-type", "text/html")
				.send(
					readFileSync(
						resolve(
							process.cwd(),
							".scalar",
							"public",
							"errors",
							"500.html"
						),
						"utf-8"
					).replace("[ERROR_SUBS_LANG]", locale)
				);
		}
	};

	for await (const path of routes) {
		const baselinePath = path.split(
			resolve(process.cwd(), "app", "pages")
		)[1];

		const fastifyPath = baselinePath
			.replace("index.tsx", "")
			.replace(".tsx", "")
			.replace(/\[[a-zA-Z0-9_]+\]/, (m) => {
				return ":" + m.substring(1, m.length - 1);
			})
			.replace(/\/$/, "");

		if (fastifyPath.startsWith("@layout")) {
			continue;
		}

		const handler = async (
			req: FastifyRequest,
			res: FastifyReply
		) => {
			try {
				// await l10n.load(req);

				const compiledPath = resolve(
					pagesBuildDir,
					baselinePath.substring(1).replace(".tsx", ".js")
				);

				const module = (
					await import(windowsPrefix + compiledPath)
				).default;

				const Component = module.default;

				const isAsync =
					Component.constructor.name === "AsyncFunction";

				if (typeof Component == "undefined") {
					return res.send("");
				}

				const props = {
					path: req.url,
					params: req.params || {},
					meta: module.meta || {},
					url: new URL(req.url, `http://${req.hostname}`),
					formData: new URLSearchParams(
						(req.body as string) || ""
					),
					req,
					res
				};

				process.env.SCALAR_ORIGINAL_PATH = path.split(
					process.cwd()
				)[1];

				try {
					let CompEl: any = null;

					if (isAsync) {
						const Comp = await Component(props);

						console.log(Comp);

						CompEl = cloneElement(Comp);
					} else {
						CompEl = createElement(Component, props);
					}

					const html = renderToString(
						createElement(Layout, {
							...props,
							Component: () => CompEl
						}), {}, { pretty: true }
					);

					res.header("content-type", "text/html");
					res.send(addMPLLicenseHeader(html));
				} catch (e) {
					console.error(e);

					serverErrHandler(500, req, res);
				}
			} catch (e) {
				console.error(e);

				serverErrHandler(500, req, res);
			}
		};

		if (
			parseInt(fastifyPath.split("/")[1]).toString() ==
			fastifyPath.split("/")[1]
		) {
			const statusCode = parseInt(fastifyPath.split("/")[1]);

			// We have a static HTML page specifically for 500 errors
			if (statusCode == 500) return;

			errorHandlers.set(statusCode, handler);
		} else {
			server.get(fastifyPath, handler);
			server.post(fastifyPath, handler);
		}
	}

	server.setNotFoundHandler((req, res) =>
		serverErrHandler(404, req, res)
	);

	server.setErrorHandler((err, req, res) => {
		const statusCode = err.statusCode || 500;

		return serverErrHandler(statusCode, req, res);
	});

	done();
};
