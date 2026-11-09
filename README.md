# data-analysis-rep
Template repository for the course "MINC 1006 - Data analysis for field biologists 2026". 

**How to use R and GitHub:**  
1. Clone repository:
You first need to clone your personal course repository onto your local machine. To do this follow these steps:
  1. Copy the HTTPS URL of your person repository by clicking on the green *Code* button.  
  2. Open RStudio and go to *File* - *New Project* - *Version Control* - *Git*.  
  3. paste the URL of your personal repository and choose a location on your computer where you want to save the project.  
  4. Click on *Create Project*.

2. Check if everything works:
Within the r-project run the script "test_setup.R". If any errors occur while running the script, please inform us.

3. **Quarto**:
In Quarto documents you can combine your text, your code and your results into one file. A Quarto document (.qmd) lets you write your paper, conduct your analysis and output your figures all in one file. It is a direct successor to Markdown documents (.md) and uses the same syntax.  
  1. To test the quarto installation, open the qmd-file "Quarto_test.qmd" in your personal course repository.  
  2. Click on *Render* at the top of the editor.  
  3. An HTML document should automatically be generated and opened in the viewer panel. If no HTML document is generated, please tell us.  


**folder structure**:  
Each task has its own folder in the GitHub repository. The Structure within those folders is always the same:  
1. Data: Here you store all data sets used for your analysis. You can create additional subfolders if needed, for example for raw and processed data.    
2. Scripts: Save all R scripts related to this specific task in this folder. You can create multiple scripts for different purposes, such as data preparation, data manipulation or statistical analysis.  
3. Results: Store the results of your analysis here.  
4. Figures: Save all figures and plots generated with R in this folder, such as graphs, charts or maps.  
  
**.gitignore**:  
.gitignore is a configuration file that tells Git which files and directories to ignore. Files listed in .gitignore are not being tracked by Git and not uploaded to GitHub. Otherwise, many temporary files, e.g., Rhistory, Rproj.user, or *qgs.bak, would be uploaded everytime you commit and push your project. It also prevents large files from being uploaded and bloating the repository.     

For QGIS: Large files like .shp, .tif or .geojson should not be uploaded to GitHub but rather be stored on your local computer.   

**test_setup**:  
This is a test script to check the functionality of R and whether GitHub is correctly connected to the R-project file. Please run this script and report any errors that occur.   

**.gitkeep**:   
Sometimes you will see a .gitkeep file. This is just a placeholder to create empty folders in GitHub. Just ignore theses files.  

**Quarto_test**:  
This is a quarto file to test whether you can work with quarto in your RStudio environment. After clicking on *render* it generates a HTML document. This is why you see two "Quarto_test" files in your repository. The qmd.file and the generated html output.  

**quarto_cheatsheet.pdf**:  
Helpful cheatsheet for quarto documents.  
