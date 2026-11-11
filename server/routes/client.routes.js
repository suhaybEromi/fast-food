import authClientRoutes from "./client/auth.routes.js";
import foodClientRoutes from "./client/food.routes.js";
import orderClientRoutes from "./client/order.routes.js";
import notificationClientRoutes from "./client/notification.routes.js";
import customerClientRoutes from "./client/customer.routes.js";
import couponClientRoutes from "./client/coupon.routes.js";
import bannerClientRoutes from "./client/banner.routes.js";
import deliveryClientRoutes from "./client/delivery.routes.js";

import { orderRateLimit } from "../middlewares/security.js";

export const registerClientRoutes = (app, clientPrefix) => {
  app.use(`${clientPrefix}/auth`, authClientRoutes);
  app.use(`${clientPrefix}/food`, foodClientRoutes);
  app.use(`${clientPrefix}/order`, orderRateLimit, orderClientRoutes);
  app.use(`${clientPrefix}/notification`, notificationClientRoutes);
  app.use(`${clientPrefix}/customer`, customerClientRoutes);
  app.use(`${clientPrefix}/coupon`, couponClientRoutes);
  app.use(`${clientPrefix}/banner`, bannerClientRoutes);
  app.use(`${clientPrefix}/delivery`, deliveryClientRoutes);
};
