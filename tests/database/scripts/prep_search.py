import pandas as pd

# cd to tests/database before running using python3 scripts/prep_search.py 

# helps prioritize listings / queries related to marketplace
MARKETPLACE_WORDS = [
    "chair", "desk", "table", "couch", "sofa", "bed", "mattress",
    "lamp", "fridge", "refrigerator", "microwave", "tv", "television",
    "monitor", "laptop", "computer", "keyboard", "mouse", "charger",
    "printer", "bike", "bicycle", "scooter", "backpack", "bag",
    "textbook", "book", "calculator", "jacket", "coat", "shoes",
    "sneakers", "hoodie", "rug", "shelf", "dresser", "fan",
    "vacuum", "bottle", "mirror", "storage", "bin", "speaker",
    "headphones", "stand"
]

# used to check what marketplace word is 
# contained by listing title if any
def get_product_name(title):
    title = str(title).lower()

    for word in MARKETPLACE_WORDS:
        if word in title:
            return word
    
    return "miscellaneous"

# used to check if query contains some marketplace word
def contains_marketplace_word(query):
    query = str(query).lower()
    return any(word in query for word in MARKETPLACE_WORDS)



# load ebay listings
ebay_listings = pd.read_csv("data/ebay_listings.tsv", sep="\t")

# keep just unique listing names
ebay_titles = ebay_listings[["source"]].dropna().drop_duplicates()

# set the product_name and desc for each listing row, name just to make visually appealing on app
ebay_titles["product_desc"] = ebay_titles["source"]
ebay_titles["product_name"] = ebay_titles["source"].apply(get_product_name)
ebay_titles = ebay_titles[["product_name", "product_desc"]]

# separates the rows containing marketplace words from the ones not
marketplace_rows = ebay_titles[ebay_titles["product_name"] != "miscellaneous"]
misc_rows = ebay_titles[ebay_titles["product_name"] == "miscellaneous"]

# take samples, with 80% containing from marketplace words
marketplace_sample = marketplace_rows.sample(min(1600, len(marketplace_rows)), random_state=42)
misc_sample = misc_rows.sample(min(400, len(misc_rows)), random_state=42)

final_ebay_df = pd.concat([marketplace_sample, misc_sample])



# load amazon queries
amazon_queries = pd.read_parquet("data/amazon_queries.parquet")

# keep only queries matched with US products  
# make sure the match was exact or substitute - query is more likely to be useful
amazon_queries = amazon_queries[
    (amazon_queries["product_locale"] == "us") &
    (amazon_queries["esci_label"].isin(["E", "S"])) ]

# keep just unique queries
amazon_queries = amazon_queries[["query"]].dropna().drop_duplicates()

# remove very short junk
amazon_queries = amazon_queries[amazon_queries["query"].str.len() >= 3]

# separates queries containing marketplace words from the ones not
marketplace_queries = amazon_queries[amazon_queries["query"].apply(contains_marketplace_word)]
misc_queries = amazon_queries[~amazon_queries["query"].apply(contains_marketplace_word)]

# take samples, with 80% containing from marketplace words
marketplace_query_sample = marketplace_queries.sample(
    min(40, len(marketplace_queries)),
    random_state=42)
misc_query_sample = misc_queries.sample(
    min(10, len(misc_queries)),
    random_state=42)

final_queries_df = pd.concat([marketplace_query_sample, misc_query_sample])


# export to CSV (will overwrite existing csv)
final_ebay_df.to_csv("data/ebay_titles_sample.csv", index=False)
final_queries_df.to_csv("data/amazon_queries_sample.csv", index=False)

print("saved ebay_titles_sample.csv:", len(final_ebay_df))
print("saved amazon_queries_sample.csv:", len(final_queries_df))