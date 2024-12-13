;; Artwork NFT Contract

(define-non-fungible-token artwork uint)

(define-data-var last-token-id uint u0)

(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-already-exists (err u102))

(define-map artwork-metadata
  uint
  {
    artist: (string-ascii 256),
    title: (string-ascii 256),
    creation-date: uint,
    medium: (string-ascii 100),
    is-physical: bool,
    image-uri: (optional (string-utf8 256))
  }
)

(define-public (mint (artist (string-ascii 256)) (title (string-ascii 256)) (creation-date uint) (medium (string-ascii 100)) (is-physical bool) (image-uri (optional (string-utf8 256))))
  (let
    (
      (token-id (+ (var-get last-token-id) u1))
    )
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (try! (nft-mint? artwork token-id tx-sender))
    (map-set artwork-metadata token-id {artist: artist, title: title, creation-date: creation-date, medium: medium, is-physical: is-physical, image-uri: image-uri})
    (var-set last-token-id token-id)
    (ok token-id)
  )
)

(define-public (transfer (token-id uint) (sender principal) (recipient principal))
  (begin
    (asserts! (is-eq tx-sender sender) err-owner-only)
    (nft-transfer? artwork token-id sender recipient)
  )
)

(define-read-only (get-owner (token-id uint))
  (ok (nft-get-owner? artwork token-id))
)

(define-read-only (get-metadata (token-id uint))
  (ok (unwrap! (map-get? artwork-metadata token-id) err-not-found))
)

(define-read-only (get-last-token-id)
  (ok (var-get last-token-id))
)

