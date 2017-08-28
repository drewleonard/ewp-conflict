library(countrycode)

# read conflict CSV
conflict <- read.csv("ewp-conflicts-data.csv")

# pull cown codes
cown <- conflict$COWCCODE

# add leading zeroes to cown code
# this adds zero values to NA values still
# cown <- sprintf("%03d", cown)

# convert cown codes to iso3n codes, and place them in new column
iso3n <- countrycode(conflict$COWCCODE, 'cown', 'iso3n')
iso3n <- sprintf("%03d", iso3n)

# create df from codes
key <- data.frame(cown, iso3n)
names(key) <- c("cown", "iso3n")
print(key)

# write key to csv
write.csv(key, file = "countryCodeKey.csv", row.names = FALSE)