# M.INC 1006, 17 November 2026
# From Earth Engine to R: join the Landsat table to the field data
#
# Question: does burn severity seen from space (dNBR) predict the tree
# regeneration that field teams counted after the fire?
#
# You need three files. Paths are relative to your repository, so open
# your R project first (the .Rproj file) and do not use setwd().
#   postfire_practice.csv            field data from 10 November,
#                                    in In-class_Practice/Day2_10.11.26/data/
#   MINC1006_fire_sites_for_GEE.csv  site list, with coordinate precision,
#                                    in In-class_Practice/Day7_17.11.26/data/
#   MINC1006_fire_sites_landsat.csv  your export from Earth Engine: download
#                                    it from Google Drive into the same folder

library(tidyverse)
library(lme4)

# 1. Read the data ------------------------------------------------------
path_day2 <- "In-class_Practice/Day2_10.11.26/data/"
path_today <- "In-class_Practice/Day7_17.11.26/data/"
list.files(path_today)                   # is your export there?

field <- read_csv(paste0(path_day2, "postfire_practice.csv"),
                  na = c("", "NA", "-9999"))
sites <- read_csv(paste0(path_today, "MINC1006_fire_sites_for_GEE.csv"))
landsat <- read_csv(paste0(path_today, "MINC1006_fire_sites_landsat.csv"))

# 2. Check the export before you use it ---------------------------------
glimpse(landsat)
n_distinct(landsat$site_id)              # how many sites?
range(landsat$year)                      # which years?
landsat |> summarise(across(c(NDVI_median, NBR_median), ~ mean(is.na(.x))))

# How many clear observations per year? Few observations, weak composite.
landsat |>
  group_by(year) |>
  summarise(mean_clear = mean(NBR_count, na.rm = TRUE)) |>
  ggplot(aes(year, mean_clear)) +
  geom_col() +
  labs(x = NULL, y = "Mean clear observations per year")

# 3. Keep sites whose coordinates are precise enough --------------------
# Two decimal places are about 1 km, and a Landsat pixel is 30 m.
# This removes 71 of the 279 sites, and all 35 sites of one fire.
good_sites <- sites |>
  filter(coord_decimals >= 4) |>
  pull(site_id)

length(good_sites)                       # 208 sites are left

# 4. Calculate burn severity --------------------------------------------
# Join the fire year, and count years relative to the fire.
# A July composite of the fire year can be from before the fire, so we
# compare the three years before it with the year after it.
landsat_rel <- landsat |>
  filter(site_id %in% good_sites, NBR_count >= 2) |>
  left_join(select(sites, site_id, burn_year), by = "site_id") |>
  mutate(rel_year = year - burn_year)

severity <- landsat_rel |>
  filter(rel_year %in% c(-3, -2, -1, 1)) |>
  mutate(period = if_else(rel_year < 0, "before", "after")) |>
  group_by(site_id, period) |>
  summarise(NBR = mean(NBR_median), .groups = "drop") |>
  pivot_wider(names_from = period, values_from = NBR) |>
  mutate(dNBR = before - after)

# Mean recovery curve: is the fire visible at all?
landsat_rel |>
  filter(between(rel_year, -5, 15)) |>
  group_by(rel_year) |>
  summarise(NBR = mean(NBR_median)) |>
  ggplot(aes(rel_year, NBR)) +
  geom_vline(xintercept = 0, linetype = 2) +
  geom_line() +
  labs(x = "Years since fire", y = "NBR")

# 5. Join the satellite data to the field data --------------------------
sites_joined <- field |>
  inner_join(severity, by = "site_id") |>
  filter(!is.na(dNBR), !is.na(total_sdlng_sucker_dens))

nrow(sites_joined)                       # how many sites are left?
n_distinct(sites_joined$burn_id)         # in how many fires?

# Check the number after every filter. If you used residual_organic
# here instead, only 4 fires would be left.

# 6. Look, then model ---------------------------------------------------
ggplot(sites_joined, aes(dNBR, total_sdlng_sucker_dens + 1,
                         colour = burn_id)) +
  geom_point() +
  scale_y_log10() +
  labs(x = "dNBR (higher = more severe)",
       y = "Seedlings and suckers + 1",
       colour = "Fire")

# Sites within a fire are not independent, as on 16 November.
model_lm <- lm(log1p(total_sdlng_sucker_dens) ~ dNBR, data = sites_joined)
model_lmer <- lmer(log1p(total_sdlng_sucker_dens) ~ dNBR + (1 | burn_id),
                   data = sites_joined)
summary(model_lm)
summary(model_lmer)

plot(model_lmer)                         # residuals against fitted values
