//export { auth as middleware } from "@/auth";

import { auth } from "@/lib/auth";

const authPage = ["/pages/dashboard"];
const noAuthPage = ["/"];

export default auth((req) => {
  if (!req.auth && authPage.includes(req.nextUrl.pathname)) {
    const newUrl = new URL("/", req.nextUrl.origin);
    return Response.redirect(newUrl);
  } else if (req.auth && noAuthPage.includes(req.nextUrl.pathname)) {
    const newUrl = new URL("/pages/dashboard", req.nextUrl.origin);
    return Response.redirect(newUrl);
  }
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
