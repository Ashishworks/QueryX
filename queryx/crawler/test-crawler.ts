import { crawlerConfig } from "../config/crawler";
import { crawl } from "./crawler";

crawl(
  crawlerConfig.seeds,
  crawlerConfig.maxPages
);