# Task 1 data: post-fire tree regeneration in the Taiga Plain (NWT, Canada)

## Source

Baltzer, J.L., Day, N.J., Walker, X.J., Greene, D.F., Mack, M.C., et al. (2022): ABoVE: Synthesis of Post-Fire Regeneration Across Boreal North America, Version 1.1. ORNL DAAC, Oak Ridge, Tennessee, USA. <https://doi.org/10.3334/ORNLDAAC/1955> (downloaded 20 October 2026)

The original data file and the user guide are in the folder `original/`. Read the user guide for the full description of the variables and the species codes.

## What is in this folder

| File | Content |
|------------------------------------|------------------------------------|
| `data/sites_taiga_plain.csv` | One row per site: project, fire (`burn_id`), site ID, years, coordinates, elevation, moisture class, residual organic layer, time since last fire, canopy combustion, pre-fire stem densities by species |
| `data/regeneration_taiga_plain.csv` | One row per site: post-fire seedling densities by species (and aspen suckers), plus the conifer and broadleaf totals |
| `scripts/analysis_llm.R` | The AI-generated script you have to check |
| `bug_report_template.qmd` | Template for your bug report |
| `original/` | Original data file and user guide (do not change these files) |

The two data files contain all 190 rows of the original file from the Taiga Plain ecozone. The values were not changed; the only change is that the columns were split into a site table and a regeneration table, linked by `site_id`.

## Important notes

- **Missing values:** a value of `-9999` means that a variable was **not measured** at a site (for example, a species that was not recorded in a study). It does not mean 0. The user guide does not say this explicitly, but it is used consistently in the file. Empty cells are also missing values.
- **Units:** seedling and sucker densities are given per m², pre-fire stem densities per m², residual organic layer depth in cm, time since last fire (`tslf`) in years.
- **Moisture classes:** 1 = dry, 2 = moist, 3 = wet.
- **Species codes** (from the user guide): `picmar` black spruce (*Picea mariana*), `picgla` white spruce (*Picea glauca*), `pinban` jack pine (*Pinus banksiana*), `larlar` tamarack (*Larix laricina*), `betneo` Alaska birch (*Betula neoalaskana*), `betpap` paper birch (*Betula papyrifera*), `poptre` trembling aspen (*Populus tremuloides*), `popbal` balsam poplar (*Populus balsamifera*). `conifer_...` and `broad_...` are totals, not species.
- **Column names:** the user guide sometimes writes variable names differently from the data file. The names in the data file are the ones that work in R.

## How to cite these data

Cite the dataset as given above whenever you use it, including in your bug report.
