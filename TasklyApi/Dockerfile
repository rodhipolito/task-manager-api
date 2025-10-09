# build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY . .
RUN dotnet restore
RUN dotnet publish -c Release -o /app

# runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app

# Render usa a variável de ambiente PORT automaticamente
ENV ASPNETCORE_URLS=http://0.0.0.0:${PORT}
COPY --from=build /app ./
EXPOSE ${PORT}

CMD ["dotnet", "TasklyApi.dll"]
