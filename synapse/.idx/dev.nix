{ pkgs, ... }: {
  # Pacotes disponíveis no ambiente
  packages = [
    pkgs.nodejs_20
    pkgs.nodePackages.npm
    pkgs.nodePackages.typescript
    pkgs.nodePackages.typescript-language-server
  ];

  # Canal do Nixpkgs
  channel = "stable-24.05";

  # Configurações do workspace
  idx = {
    # Extensões do VS Code para instalar automaticamente
    extensions = [
      "bradlc.vscode-tailwindcss"
      "dbaeumer.vscode-eslint"
      "esbenp.prettier-vscode"
      "formulahendry.auto-rename-tag"
      "dsznajder.es7-react-js-snippets"
    ];

    # Comando que roda ao criar o workspace pela primeira vez
    workspace = {
      onCreate = {
        default = ''
          npm install
        '';
      };
      # Comando que roda toda vez que o workspace abre
      onStart = {
        default = ''
          npm run dev
        '';
      };
    };

    # Configuração do preview (a janela do app dentro do Studio)
    previews = {
      enable = true;
      previews = {
        web = {
          command = ["npm" "run" "dev" "--" "--port" "$PORT" "--hostname" "0.0.0.0"];
          manager = "web";
        };
      };
    };
  };
}
