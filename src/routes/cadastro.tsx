import { createFileRoute } from "@tanstack/react-router";
import { AuthPage } from "@/components/app/AuthPage";
export const Route = createFileRoute("/cadastro")({ component: () => <AuthPage mode="cadastro" /> });
