FROM rustlang/rust:nightly AS builder

WORKDIR /app
COPY . /app
RUN cargo +nightly build --release

FROM rustlang/rust:nightly 

COPY --from=builder /app/target/release/cilantrify-api /cilantrify-api

CMD ["/cilantrify-api"]