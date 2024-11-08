const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const port = 3000;

app.use(cors());

const API_KEY = "65245708a11832244aaac8ccd884ab56";
const BASE_URL = "http://api.mediastack.com/v1/news";

app.get('/news', async (req, res) => {
    let queryParams = {
        access_key: API_KEY,
        sort: "published_desc",
        limit: 5
    };

    const { query } = req.query;

    if (!query) {
        return res.status(400).json({ error: "Please specify a news category, source, or country." });
    }
    
    const [type, ...keywords] = query.split(' ');
    const keywordString = keywords.join(' ');

    switch (type.toLowerCase()) {
        case "sports":
        case "business":
        case "health":
        case "technology":
        case "entertainment":
            queryParams.categories = type;
            break;
        case "bbc":
        case "cnn":
        case "aljazeera":
        case "reuters":
            queryParams.sources = type;
            break;
        case "us":
        case "uk":
        case "au":
        case "in":
            queryParams.countries = type;
            break;
        default:
            queryParams.keywords = type + " " + keywordString;
            break;
    }

    if (keywordString) {
        queryParams.keywords = keywordString;
    }

    try {
        const response = await axios.get(BASE_URL, { params: queryParams });
        const articles = response.data.data;

        if (!articles || articles.length === 0) {
            return res.status(404).json({ error: "No news articles found for your request." });
        }

        let newsData = articles.map(article => ({
            title: article.title,
            source: article.source,
            published: new Date(article.published_at).toLocaleString(),
            url: article.url
        }));

        res.json({ news: newsData });

    } catch (error) {
        console.error("Error fetching news:", error);
        res.status(500).json({ error: "An error occurred while fetching news. Please try again later." });
    }
});

app.listen(port, () => {
    console.log(`News API server listening at http://localhost:${port}`);
});
