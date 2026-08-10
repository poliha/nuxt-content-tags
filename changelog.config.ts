export default {
  // changelogen builds Contributors from git author metadata. When an address
  // maps to a GitHub user it renders the handle; when it does not, it prints the
  // raw email into a public file.
  //
  // The noreply identity resolves to @poliha, so it is deliberately not excluded
  // here: the credit line is worth keeping. The old personal address does not
  // resolve, so it is suppressed in case it resurfaces from history or from a
  // machine with stale git config.
  excludeAuthors: [
    'poliha2002@gmail.com',
  ],
}
