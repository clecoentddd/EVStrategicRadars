const express = require('express');
const bodyParser = require('body-parser');
const ValueDistance = require('..radars/model/config');

const app = express();

app.use(bodyParser.json());

app.post('/api/items/create', (req, res) => {
    const { selectedOption } = req.body;

    if (!Object.values(ValueOptions).includes(selectedOption)) {
        return res.status(400).send("A valid option must be selected.");
    }

    // Process the item creation
    res.send(`Item created successfully with option: ${selectedOption}`);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});