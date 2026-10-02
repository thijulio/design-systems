# Serves the pre-built Storybook (apps/docs/storybook-static) for local visual QA.
#
# Rebuild the static site on the host first:
#   node_modules/.bin/storybook build -c apps/docs/.storybook -o apps/docs/storybook-static
# (or: nx build-storybook docs — once the Nx plugins load again).
FROM nginx:1.27-alpine

COPY apps/docs/storybook-static /usr/share/nginx/html

EXPOSE 80
