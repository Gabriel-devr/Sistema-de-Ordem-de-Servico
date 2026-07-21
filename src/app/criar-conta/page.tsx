"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, FormEvent } from "react";

const inputClass =
  "w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800";

export default function CriarContaPage() {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!nome.trim() || !email.trim() || !senha) return;
    router.push("/pipe");
  }

  return (
    <div className="flex flex-1 items-center justify-center bg-gray-200 p-6 dark:bg-neutral-950">
      <div className="w-full max-w-sm rounded-lg border border-gray-300 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <h1 className="mb-1 text-xl font-semibold text-gray-900 dark:text-gray-100">
          Criar conta
        </h1>
        <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
          Preencha os dados para começar.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
              Nome
            </label>
            <input
              type="text"
              required
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
              Senha
            </label>
            <input
              type="password"
              required
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className={inputClass}
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-300"
          >
            Criar conta
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
          Já tem conta?{" "}
          <Link
            href="/login"
            className="font-medium text-gray-900 hover:underline dark:text-gray-100"
          >
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
