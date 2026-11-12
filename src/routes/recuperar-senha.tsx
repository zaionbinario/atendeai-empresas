import { createFileRoute } from "@tanstack/react-router";
import { AuthPage } from "@/components/app/AuthPage";
export const Route = createFileRoute("/recuperar-senha")({ component: () => <AuthPage mode="recuperar" /> });
