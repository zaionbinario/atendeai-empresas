import { createFileRoute, redirect } from "@tanstack/react-router";

// A gestão de empresas fica exclusivamente na área administrativa.
export const Route = createFileRoute("/empresas")({
  beforeLoad: () => { throw redirect({ to: "/administracao" }); },
});
