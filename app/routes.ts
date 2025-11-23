import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
  layout("routes/root.tsx", [
    layout("routes/landing.tsx", [
      index("routes/home.tsx"),
      route("/product/:slug", "routes/singleProduct.tsx"),
      route("/event/:eventId", "routes/event.$eventId.tsx"),
      route("/teams/:slug", "routes/teams.$slug.tsx"),
      route("/players/:slug", "routes/players.$slug.tsx"),
      route("/events/:slug", "routes/events.$slug.tsx"),
      route("/team-player/:id", "routes/teamPlayer.tsx", [
        index("routes/team-player/currentEvents.tsx"),
        route("upcoming-events", "routes/team-player/upcomingEvents.tsx"),
        route("sales-history", "routes/team-player/salesHistory.tsx"),
      ]),

      // Публичные информационные страницы
      route("about", "routes/about.tsx"),
      route("framing", "routes/framing.tsx"),
      route("partners", "routes/partners.tsx"),
      route("authenticate", "routes/authenticate.tsx"),
      route("a", "routes/a.tsx"), // NFC редирект
      route("delivery", "routes/delivery.tsx"),
      route("help", "routes/help.tsx"),

      // Корзина и оформление заказа
      route("cart", "routes/cart.tsx"),
      route("checkout/delivery", "routes/checkout.delivery.tsx"),
      route("checkout/payment", "routes/checkout.payment.tsx"),
      route("payment-success", "routes/payment-success.tsx"),

      // Страницы футера
      route("faq", "routes/faq.tsx"),

      // Юридические документы
      route("legal/offer", "routes/legal/offer.tsx"),
      route("legal/privacy-policy", "routes/legal/privacy-data-policy.tsx"),
      route("legal/auction-rules", "routes/legal/auction-rules.tsx"),
      route("product-designer", "routes/product-designer.tsx"),

      // Приватные роуты с проверкой авторизации
      layout("routes/private.tsx", [
        route("profile", "routes/profile.tsx", [
          index("routes/profile/overview.tsx"),
          route("my-bets", "routes/profile/my-bets.tsx"),
          route("favorite-teams", "routes/profile/favorite-teams.tsx"),
          route("my-orders", "routes/profile/my-orders.tsx"),
          route("my-addresses", "routes/profile/my-addresses.tsx"),
          route("payment-methods", "routes/profile/payment-methods.tsx"),
          route("promo-codes", "routes/profile/promo-codes.tsx"),
          route("my-wishlist", "routes/profile/my-wishlist.tsx"),
          route("support", "routes/profile/support.tsx"),
          route("notifications", "routes/profile/notifications.tsx"),
          route("notification-settings", "routes/profile/notification-settings.tsx"),
        ]),

        // Админ layout для администраторов
        layout("routes/admin.tsx", [
          route("admin", "routes/admin/dashboard.tsx"),
          route("admin/users", "routes/admin/users.tsx"),
          route("admin/promo-codes", "routes/admin/promo-codes.tsx"),
          route("admin/products", "routes/admin/products.tsx"),
          route("admin/sports", "routes/admin/sports.tsx"),
          route("admin/item-labels", "routes/admin/item-labels.tsx"),
          route("admin/item-types", "routes/admin/item-types.tsx"),
          route("admin/player-positions", "routes/admin/player-positions.tsx"),
          route("admin/teams", "routes/admin/teams.tsx"),
          route("admin/players", "routes/admin/players.tsx"),
          route("admin/orders", "routes/admin/orders.tsx"),
          route("admin/events", "routes/admin/events.tsx"),
          route("admin/order/:orderId", "routes/admin/order.$orderId.tsx"),
          route("admin/authentication", "routes/admin/authentication.tsx"),
        ]),
      ]),

      // 404 страница
      route("*", "routes/404.tsx"),
    ]),
    route("yandex-callback", "routes/yandex-callback.tsx"),
  ]),
] satisfies RouteConfig;
