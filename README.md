# [AI Interior Design] - Transform your room with AI

An interior transformation application powered by artificial intelligence that allows you to upload a photo of any room and see how it would look in various design styles.

![AI Interior Design](./public/screenshot.png)

## How it works

The application uses advanced AI technology to generate variations of room designs. You can upload a photo of any room, and the system will process it through the AI model using a Next.js API route, then return your generated room. The machine learning model is hosted on [Replicate](https://replicate.com), and [Bytescale](https://www.bytescale.com/) is used for image storage.

## Technologies Used

- **AI Model** - machine learning model for generating room variations
- **Replicate** - ML model hosting
- **Bytescale** - image storage and processing
- **UpStash (Redis)** - optional rate limiting
- **Next.js** - frontend and API framework
- **React** - UI library
- **Tailwind CSS** - component styling

## Running Locally

### Cloning the repository to your local machine

```bash
git clone https://github.com/Mavline/ai-interior-design
cd ai-interior-design
```

### Creating accounts for API keys

1. Go to [Replicate](https://replicate.com/) to create an account
2. Click on your profile picture in the top left corner, and click on "API Tokens"
3. Copy your API token

4. Go to [Bytescale](https://www.bytescale.com/) to create an account
5. Get your API key for image uploads

6. Go to [UpStash](https://upstash.com/) to create an account
7. Create a Redis database and get your REST URL and token

### Storing the API keys in .env

Create a .env file in the root directory of the project and add the following variables:

```
REPLICATE_API_KEY=your_replicate_key
NEXT_PUBLIC_UPLOAD_API_KEY=your_bytescale_key
UPSTASH_REDIS_REST_URL=your_redis_url
UPSTASH_REDIS_REST_TOKEN=your_redis_token
```

### Installing the dependencies

```bash
npm install
```

### Running the application

After that, run the application, and it will be available at `http://localhost:3000`.

```bash
npm run dev
```

## Features

- Upload a photo of your room
- Select an interior design style
- Adjust transformation strength
- Generate a new room based on your photo
- View original and generated rooms side by side
- Download the result
- Generate new variations without re-uploading the photo

## Website

This project is deployed at [interiordesgn.com](https://interiordesgn.com)

## License

This repository is MIT licensed.
