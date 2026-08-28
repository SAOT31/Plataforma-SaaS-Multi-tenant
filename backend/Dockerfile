FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /app

COPY PlataformaSaaS.slnx ./
COPY src/Domain/PlataformaSaaS.Domain.csproj src/Domain/
COPY src/Application/PlataformaSaaS.Application.csproj src/Application/
COPY src/Infrastructure/PlataformaSaaS.Infrastructure.csproj src/Infrastructure/
COPY src/Api/PlataformaSaaS.Api.csproj src/Api/

RUN dotnet restore PlataformaSaaS.slnx

COPY src/ src/
RUN dotnet publish src/Api/PlataformaSaaS.Api.csproj -c Release -o /out

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /out ./
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080
ENTRYPOINT ["dotnet", "PlataformaSaaS.Api.dll"]
