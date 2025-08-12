export const GA_ID = "G-0BZPBK1SSX";
export function sendPageView(path: string) {
	if (
		// @ts-expect-error: gtag 타입 에러 발생
		typeof window.gtag === "function" &&
		location.hostname.endsWith("duckon.site")
	) {
		// @ts-expect-error: gtag 타입 에러 발생
		window.gtag("config", GA_ID, {page_path: path});
	}
}
