import type { RouteObject } from "react-router-dom";

/** Remplace le module virtuel `tempo-routes` en build production (plugin Tempo désactivé). */
const routes: RouteObject[] = [];
export default routes;
