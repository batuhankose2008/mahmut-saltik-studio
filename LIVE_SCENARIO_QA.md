# Live scenario QA — 2026-09-10

- Public commission request API: HTTP 200, returned UUID and `status: new`.
- Admin commission list: created request visible.
- Admin status update: HTTP 200, status changed to `contacted`.
- Admin cleanup: after Render finished deploying the latest commit, DELETE returned HTTP 200 and removed the QA request.
- Local JavaScript syntax checks, Python compile, and pytest: 8 passed.
- Render auto-deploy can briefly serve the previous build immediately after push; the delete endpoint became available after the subsequent deploy completed.
- Browser desktop rendering showed the real Storage artwork in the hero. Browser viewport resizing is not exposed by the connected browser tool, so mobile behavior was additionally checked from the responsive CSS breakpoints and HTML viewport meta tag; a dedicated 375px screenshot still requires a browser/device viewport tool.
