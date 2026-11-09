# ==========================================
# Setup Test – Data Analysis Course
# ==========================================

# This is a test script to check if R works and whether it is connected
# to the GitHub Repository.

#### 1. check R version ####

R.version.string

#### 2. Check working directory ####

getwd()

# Your working directory should be the R-Projectfile: "data-analysis-2026_Proj", e. g.
#"F:/M.Sc. Ökologie_neu/01_Studium/WS 2026/data_analysis_for_field_biologists_Proj/data-analysis-2026_Proj"

#### 3. check required folders ####

dir.exists("task1")
dir.exists("task2")
dir.exists("task3")

# This function checks if the directories (folders) "task1", "task2" and "task3" exist

#### 4. Load required packages ####

library(dplyr) # useful package for data handling and manipulation
library(sf) # necessary to work with simple features (vector spatial data) in R
library(terra) # for handling vetor data and raster grid data (SpatRaster) in R
library(here) # easy file referencing in R
library(ggplot2) # offers advanced plot functions

# the function library() loads an already installed R-package so that the function within this
# package can be used in the session. Every package has to be loaded again when R-Studio is closed.
# If some of the packages are not installed, use the function install.packages() to install the missing packages.

#install.packages(dplyr)
#install.packages(sf)
#install.packages(here)
#install.packages(ggplot2)

#### 5. Test simple calculation in R ####
2 + 2

#### 6. Check the plot function ####
plot(1:10, col = "red", main = "Test plot")


# Check ggplot function
test_df <- data.frame(ObservedBirds = seq(1,10, by = 1),
                         Happiness = seq(10,100, by = 10))

ggplot(test_df, aes(x = ObservedBirds, y = Happiness))+
  geom_point()

