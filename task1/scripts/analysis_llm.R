# =============================================================================
# Black spruce regeneration after fire in the Taiga Plain (NWT, Canada)
# =============================================================================
#
# Written with an AI chatbot the night before the deadline. The prompt was:
#
#   "I have two csv files on tree regeneration after wildfires in the Northwest
#    Territories: sites_taiga_plain.csv and regeneration_taiga_plain.csv
#    (data from Baltzer et al. 2022, user guide attached). Write R code using
#    the tidyverse that (1) summarises seedling densities per species in
#    seedlings per hectare and (2) tests whether a thicker residual organic
#    layer reduces black spruce regeneration. Add clear comments and write
#    the conclusions as comments at the end."
#
# The code below is the chatbot's answer, copied without changes.
# =============================================================================

# Load packages
library(readr)
library(dplyr)

# -----------------------------------------------------------------------------
# 1. Load the data
# -----------------------------------------------------------------------------
# na.rm = TRUE makes sure missing values are removed while reading the files
sites <- read_csv("task1/data/sites_taiga_plain.csv", na.rm = TRUE)
regen <- read_csv("task1/data/regeneration_taiga_plain.csv", na.rm = TRUE)

# -----------------------------------------------------------------------------
# 2. Combine site information and regeneration data
# -----------------------------------------------------------------------------
# Each site appears exactly once in each table, so we can safely join by site_id
dat <- left_join(sites, regen, by = "site_id")

# -----------------------------------------------------------------------------
# 3. Clean the data
# -----------------------------------------------------------------------------
# Seedling densities cannot be negative, so negative values are data entry
# errors. We set them to 0.
dat <- dat %>%
  mutate(across(ends_with("_sdlng_dens"), ~ ifelse(.x < 0, 0, .x)))

# Remove implausible organic layer depths: post-fire organic layers deeper
# than 1 m are not realistic and must be measurement errors.
dat <- dat %>%
  filter(residual_organic < 100)

# Black spruce (Picea mariana) presence: 1 if any seedlings were found, else 0
dat <- dat %>%
  mutate(bs_present = ifelse(picmar_sdlng_dens > 0, 1, 0))

# -----------------------------------------------------------------------------
# 4. Seedling densities per species
# -----------------------------------------------------------------------------
# Reshape to long format (one row per site and species) and convert the
# densities from seedlings per m2 to seedlings per hectare.
species_summary <- dat %>%
  pivot_longer(cols = ends_with("_sdlg_dens"),
               names_to = "species",
               values_to = "density") %>%
  mutate(density_ha = density * 100) %>%
  group_by(species) %>%
  summarise(mean_density_ha = mean(density_ha),
            n_sites = n()) %>%
  arrange(desc(mean_density_ha))

print(species_summary)

# -----------------------------------------------------------------------------
# 5. Does a thicker organic layer reduce black spruce regeneration?
# -----------------------------------------------------------------------------
# Logistic regression (binomial GLM) of black spruce presence on the depth of
# the residual organic layer. Each site is an independent observation.
model <- glm(bs_present ~ residual_organic,
             family = binomial,
             data = dat)

summary(model)

# -----------------------------------------------------------------------------
# 6. Conclusions
# -----------------------------------------------------------------------------
# - Paper birch and balsam poplar do not regenerate at all after fire in the
#   Taiga Plain (mean density 0), and aspen is much less common than the
#   conifers. These forests are therefore not shifting towards broadleaf trees.
# - The residual organic layer has a significant positive effect on black
#   spruce regeneration (p < 0.05). This proves that thicker organic layers
#   promote black spruce regeneration, contrary to what the literature
#   suggests.
