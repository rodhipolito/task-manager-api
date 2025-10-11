# ===================== build =====================
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY . .
RUN dotnet restore
RUN dotnet publish -c Release -o /app/out

# ==================== runtime ====================
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/out .
# Não defina ASPNETCORE_URLS aqui; o app lê PORT via env no Render
# Não precisa EXPOSE; o Render injeta PORT e faz port-binding automaticamente
ENTRYPOINT ["dotnet", "TasklyApi.dll"]
