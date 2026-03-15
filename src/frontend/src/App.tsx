import {
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import Layout from "./components/Layout";
import AdminDashboard from "./pages/AdminDashboard";
import BuyerDashboard from "./pages/BuyerDashboard";
import BuyerOrders from "./pages/BuyerOrders";
import FixturesPage from "./pages/FixturesPage";
import LandingPage from "./pages/LandingPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import NewBuyerIntent from "./pages/NewBuyerIntent";
import NewFixture from "./pages/NewFixture";
import NewOffer from "./pages/NewOffer";
import NewProduct from "./pages/NewProduct";
import ProductDetailPage from "./pages/ProductDetailPage";
import ProductsPage from "./pages/ProductsPage";
import RegisterBuyer from "./pages/RegisterBuyer";
import RegisterSeller from "./pages/RegisterSeller";
import SellerDashboard from "./pages/SellerDashboard";

// Root route with layout
const rootRoute = createRootRoute({
  component: Layout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: LandingPage,
});

const registerBuyerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/register/buyer",
  component: RegisterBuyer,
});

const registerSellerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/register/seller",
  component: RegisterSeller,
});

const productsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/products",
  component: ProductsPage,
});

const productDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/products/$id",
  component: ProductDetailPage,
});

const fixturesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/fixtures",
  component: FixturesPage,
});

const leaderboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/fixtures/$id/leaderboard",
  component: LeaderboardPage,
});

const buyerDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/buyer/dashboard",
  component: BuyerDashboard,
});

const newBuyerIntentRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/buyer/intents/new",
  component: NewBuyerIntent,
});

const buyerOrdersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/buyer/orders",
  component: BuyerOrders,
});

const sellerDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/seller/dashboard",
  component: SellerDashboard,
});

const newOfferRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/seller/offers/new",
  component: NewOffer,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminDashboard,
});

const newProductRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/products/new",
  component: NewProduct,
});

const newFixtureRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/fixtures/new",
  component: NewFixture,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  registerBuyerRoute,
  registerSellerRoute,
  productsRoute,
  productDetailRoute,
  fixturesRoute,
  leaderboardRoute,
  buyerDashboardRoute,
  newBuyerIntentRoute,
  buyerOrdersRoute,
  sellerDashboardRoute,
  newOfferRoute,
  adminRoute,
  newProductRoute,
  newFixtureRoute,
]);

const router = createRouter({
  routeTree,
  defaultPreload: "intent",
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
