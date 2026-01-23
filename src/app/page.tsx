"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ExclamationTriangleIcon, GearIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// 1. Lista de motores expandida
const engines = {
  google: { name: "Google", url: "https://www.google.com/search?q=" },
  brave: { name: "Brave", url: "https://search.brave.com/search?q=" },
  startpage: { name: "Startpage", url: "https://www.startpage.com/sp/search?query=" },
  duckduckgo: { name: "DuckDuckGo", url: "https://duckduckgo.com/?q=" },
  bing: { name: "Bing", url: "https://www.bing.com/search?q=" },
};

type EngineKey = keyof typeof engines;

export default function Home() {
  const [query, setQuery] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [selectedEngine, setSelectedEngine] = useState<EngineKey>("google");
  const [isModalOpen, setIsModalOpen] = useState(false); // Estado para fechar o modal

  useEffect(() => {
    const saved = localStorage.getItem("searchEngine") as EngineKey;
    if (saved && engines[saved]) {
      setSelectedEngine(saved);
    }
  }, []);

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedQuery = query.trim();

    if (trimmedQuery === "") {
      setShowAlert(true);
    } else {
      setShowAlert(false);
      const baseUrl = engines[selectedEngine].url;
      window.location.href = `${baseUrl}${encodeURIComponent(trimmedQuery)}`;
    }
  };

  const changeEngine = (key: EngineKey) => {
    setSelectedEngine(key);
    localStorage.setItem("searchEngine", key);
    setIsModalOpen(false); // Fecha o modal após selecionar
  };

  return (
    <div className="w-screen h-svh flex flex-col items-center justify-center p-4 bg-background">
      <form className="w-full max-w-lg space-y-4" onSubmit={handleSearch}>
        <div className="flex w-full items-center justify-center gap-4">
          <Input
            className="h-12 text-lg"
            type="text"
            placeholder={`Pesquisar no ${engines[selectedEngine].name}...`}
            autoComplete="off"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (e.target.value.trim() !== "") setShowAlert(false);
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

        <div className="flex justify-center">
          {/* MODAL DE CONFIGURAÇÕES */}
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              {/* 
                Estilização discreta: 
                - opacity-30 (bem clarinho)
                - hover:opacity-100 (fica normal ao passar o mouse)
                - transition-opacity (suaviza a mudança)
              */}
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 opacity-30 hover:opacity-100 transition-opacity font-light text-xs"
              >
                <GearIcon className="w-3 h-3" />
                Configurações
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[400px]">
              <DialogHeader>
                <DialogTitle>Motor de Busca</DialogTitle>
                <DialogDescription>
                  Selecione o serviço de busca padrão.
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-1 gap-2 py-4">
                {(Object.keys(engines) as EngineKey[]).map((key) => (
                  <Button
                    key={key}
                    variant={selectedEngine === key ? "default" : "outline"}
                    onClick={() => changeEngine(key)}
                    className="justify-start w-full"
                  >
                    <span className="flex-1 text-left">{engines[key].name}</span>
                    {selectedEngine === key && (
                      <span className="text-[10px] bg-primary-foreground text-primary px-2 py-0.5 rounded">
                        Ativo
                      </span>
                    )}
                  </Button>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </form>
    </div>
  );
}
