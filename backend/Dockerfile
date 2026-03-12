FROM golang:1.25-bookworm AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o /out/kube-vision-backend .

FROM gcr.io/distroless/base-debian12:nonroot

WORKDIR /app

COPY --from=builder /out/kube-vision-backend /app/kube-vision-backend

EXPOSE 8080

ENTRYPOINT ["/app/kube-vision-backend"]
