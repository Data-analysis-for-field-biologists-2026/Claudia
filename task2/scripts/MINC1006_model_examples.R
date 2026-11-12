# M.INC 1006, 16 November: one starter example per model
# This only gets you started. Your group explains, checks and presents the model.

library(tidyverse)
library(lme4)   # lmer() for group 4, and the grouseticks data for group 2

# Practice data from 10 November -----------------------------------------------
path <- "In-class_Practice/Day2_10.11.26/data/"
fires <- read_csv(paste0(path, "postfire_practice.csv"),
                  na = c("", "NA", "-9999")) |>
  # Elevation in project Fox1998 is in feet, not metres: the same fire in
  # project YT_overlap lies at about 920 m, Fox1998 at about 2,730.
  # 2,730 feet are about 830 m, so we convert Fox1998 to metres.
  mutate(
    elevation_m = if_else(project_id == "Fox1998", elevation * 0.3048, elevation),
    elevation_km = elevation_m / 1000
  )

# Group 1: linear model --------------------------------------------------------
# Does the remaining organic layer change with elevation?
m_lm <- lm(residual_organic ~ elevation_km, data = fires)
summary(m_lm)
plot(m_lm)

# Group 2: count data, Poisson GLM ---------------------------------------------
# Do ticks on grouse chicks change with height above sea level?
# The data come with lme4: one row is one chick. Type ?grouseticks to read
# what each column means.
m_count <- glm(TICKS ~ HEIGHT, family = poisson, data = grouseticks)
summary(m_count)
deviance(m_count) / df.residual(m_count)   # far above 1: overdispersion

# Group 3: presence and absence, binomial GLM ----------------------------------
# Does the chance of finding trembling aspen seedlings change with elevation?
fires <- fires |> mutate(aspen_present = poptre_sdlng_dens > 0)
m_bin <- glm(aspen_present ~ elevation_km, family = binomial, data = fires)
summary(m_bin)
exp(coef(m_bin))

# Group 4: nested data, linear mixed model -------------------------------------
# Same question as group 1, but sites are nested within fires
m_mix <- lmer(residual_organic ~ elevation_km + (1 | burn_id), data = fires)
summary(m_mix)
plot(m_mix)

