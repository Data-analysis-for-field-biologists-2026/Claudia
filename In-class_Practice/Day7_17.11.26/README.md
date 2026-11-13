# 17 November: remote sensing data and Google Earth Engine

## First: pull

This folder was added to your repository on GitHub. In RStudio, open the Git tab and press **Pull** before you change anything, so that you work on the newest version.

## What is in here

| File | What it is for |
|------------------------------------|------------------------------------|
| `scripts/MINC1006_2026_17Nov_GEE_1_fire_sites.js` | Earth Engine script 1: Landsat NDVI and NBR for the fire sites (Exercise 4) |
| `scripts/MINC1006_2026_17Nov_GEE_2_your_project.js` | Earth Engine script 2: template for your own Task 3 area (Exercise 5) |
| `scripts/MINC1006_2026_17Nov_join_GEE_with_field_data.R` | R script: joins your Earth Engine export to the field data from 10 November |
| `data/MINC1006_fire_sites_for_GEE.csv` | The 279 field sites, to upload to Earth Engine |

Your dataset card is in `task3/dataset_card.qmd`. Make one copy for each dataset you plan to use.

## Earth Engine scripts

Earth Engine scripts run in the online Code Editor, not in RStudio.

1.  Open the scripts `scripts/MINC1006_2026_17Nov_GEE_1_fire_sites.js` (script 1) `scripts/MINC1006_2026_17Nov_GEE_2_your_project.js` (script 2) in RStudio or a text editor. Copy the entire code from each script and paste it into the GEE Code Editor

    If you haven't created your own GEE project yet, refer to slide 25 of today's PowerPoint presentation for instructions

2.  Press **Save** and save each script separately in your own Earth Engine repository

3.  When you are done, copy your final version into a `.js` file in your GitHub repository and commit it. Your Task 3 code must be in GitHub, so that we can reproduce it

## Fire sites in Earth Engine

Assets tab \> NEW \> CSV file (.csv) \> choose `data/MINC1006_fire_sites_for_GEE.csv`, name it `MINC1006_fire_sites` and press UPLOAD. The upload takes a few minutes: check the Tasks tab.

## From Earth Engine to R

1.  Run the export in Earth Engine (Tasks tab \> RUN)
2.  Download `MINC1006_fire_sites_landsat.csv` from the MINC1006 folder in your Google Drive into `In-class_Practice/Day7_17.11.26/data/`
3.  Open your R project, then run the join script
