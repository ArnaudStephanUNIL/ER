install.packages('tidyr')
install.packages('magrittr')
install.packages('stringr')
install.packages('plyr')
install.packages('dplyr')
install.packages('networkD3')
install.packages('reshape2')

setwd("/Users/astephan/Desktop/ER")
library(tidyr)
library(magrittr)
library(stringr)
library(plyr)
library(dplyr)
library(networkD3)
library(reshape2)
options(digits=4)

freq <- read.csv('ER_Presse-format-ids-clean.csv', header = TRUE, sep = ",")$keywords %>%
#freq <- read.csv('ER_Revue_presse-format-ids-clean.csv', header = TRUE, sep = ",")$keywords %>%

str_split(";") %>%
unlist %>%
table %>%
data.frame %>%
arrange(-Freq)

e <- read.csv('ER_Presse-format-ids-clean.csv', header = TRUE, sep = ",")$keywords %>%
#e <- read.csv('ER_Revue_presse-format-ids-clean.csv', header = TRUE, sep = ",")$keywords %>%
  str_split(";") %>%
  lapply(function(x) {
    expand.grid(x, x, w = 1 / length(x), stringsAsFactors = FALSE)
  }) %>%
  bind_rows

e <- apply(e[, -3], 1, str_sort) %>%
  t %>%
  data.frame(stringsAsFactors = FALSE) %>%
  mutate(w = e$w)

e <- group_by(e, X1, X2) %>%
  summarise(w = sum(w)) %>%
  filter(X1 != X2)

names(e) <- c("Mot1","Mot2","Poids")
names(freq) <- c("Mot","Frequence")

#Poids relatifs
e$Poids <- e$Poids/max(e$Poids)

write.table(e, file='liens_presse_er.csv', quote = FALSE, sep=',', col.names = TRUE,
            row.names = FALSE)

write.table(freq, file='freq_presse_er.csv', quote = FALSE, sep=',', col.names = TRUE,
            row.names = FALSE)

#Matrice du top 100
e100 <- e[order(-e$Poids),]
e100 <- head(e100,10)
View(e100)

#Matrice clustering
matriceCluster <- acast(e100, Mot1~Mot2, value.var="Poids")
#On remplace les NA par des O sinon hclust ne fonctionne pas
matriceCluster[is.na(matriceCluster)] <- 0
plot(hclust(dist(abs(cor(na.omit(matriceCluster))))))

write.table(matriceCluster, file='matrice.csv', quote = FALSE, sep=',', col.names = TRUE,
            row.names = TRUE)
