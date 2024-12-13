;; Marketplace Contract

(define-map listings
  uint
  {
    seller: principal,
    price: uint,
    is-active: bool
  }
)

(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-unauthorized (err u102))

(define-public (list-artwork (token-id uint) (price uint))
  (ok (map-set listings token-id {seller: tx-sender, price: price, is-active: true}))
)

(define-public (unlist-artwork (token-id uint))
  (let
    (
      (listing (unwrap! (map-get? listings token-id) err-not-found))
    )
    (asserts! (is-eq (get seller listing) tx-sender) err-unauthorized)
    (ok (map-set listings token-id (merge listing {is-active: false})))
  )
)

(define-public (buy-artwork (token-id uint))
  (let
    (
      (listing (unwrap! (map-get? listings token-id) err-not-found))
      (price (get price listing))
    )
    (asserts! (get is-active listing) err-not-found)
    (try! (stx-transfer? price tx-sender (get seller listing)))
    (ok (map-delete listings token-id))
  )
)

(define-read-only (get-listing (token-id uint))
  (ok (unwrap! (map-get? listings token-id) err-not-found))
)

