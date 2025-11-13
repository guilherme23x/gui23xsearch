"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import Link from 'next/link';

export default function Home() {
  const [query, setQuery] = useState("");
  const [showAlert, setShowAlert] = useState(false);

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedQuery = query.trim();

    if (trimmedQuery === "") {
      setShowAlert(true);
    } else {
      setShowAlert(false);
      const url = `https://search.brave.com/search?q=${encodeURIComponent(trimmedQuery)}`;
      window.location.href = url;
    }
  };

  return (
    <>
      <form className="w-screen h-svh flex items-center justify-center" onSubmit={handleSearch}>
        <div className="w-full max-w-lg p-4 space-y-4">


          <div className="flex w-full items-center justify-center gap-4">
            <Input
              className="h-12"
              type="text"
              placeholder="Pesquisar"
              autoComplete="off"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                if (e.target.value.trim() !== "") {
                  setShowAlert(false);
                }
              }}
            />

          </div>
          {showAlert && (
            <Alert variant="destructive">
              <ExclamationTriangleIcon className="h-4 w-4" />
              <AlertTitle>Entrada Inválida</AlertTitle>
              <AlertDescription>
                Por favor, digite um termo para pesquisar.
              </AlertDescription>
            </Alert>
          )}

          <HoverCard >
            <HoverCardTrigger asChild>
              <Button type="submit" className="flex m-auto" variant="link">
                <Link  className="text-center" href="/gemini"> Gui23x - Ai </Link>
              </Button>
            </HoverCardTrigger>
          </HoverCard>



        </div>
      </form>

    </>
  );
}
