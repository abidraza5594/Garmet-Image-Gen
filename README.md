# Virtual Vogue - AI Garment Image Generator 👗✨

An advanced AI-powered e-commerce tool that transforms single garment photos into professional product shots with automated descriptions and marketing content.

## 🚀 Features

- **AI Image Generation**: Convert single garment photos into professional e-commerce model shots
- **Smart Product Descriptions**: Generate compelling, SEO-friendly titles and descriptions
- **Marketing Copy Generation**: Create social media posts and SEO keywords automatically
- **Multiple Model Options**: Choose different model genders and age groups
- **Watermark Support**: Add custom watermarks to generated images
- **API Key Failover**: Robust API key management with automatic failover
- **Batch Download**: Download all generated content as ZIP
- **Responsive Design**: Works perfectly on desktop and mobile

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS, Shadcn/ui
- **AI Integration**: Google Gemini 2.0 Flash via Genkit
- **Image Processing**: Canvas API, JSZip
- **State Management**: React Hooks

## 📦 Installation

1. Clone the repository:
```bash
git clone https://github.com/abidraza5594/Garmet-Image-Gen.git
cd Garmet-Image-Gen
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Add your Google AI API key to `.env.local`:
```
GOOGLE_AI_API_KEY=your_api_key_here
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🎯 How to Use

1. **Upload Image**: Drag and drop or click to upload a garment photo
2. **Customize Model**: Select model gender and age preferences
3. **Add Watermark**: Optionally add custom watermark text
4. **Generate**: AI automatically creates professional product shots
5. **Get Content**: Receive product titles, descriptions, and marketing copy
6. **Download**: Save individual images or download all as ZIP

## 🔧 Configuration

### API Keys
The app supports multiple API key sources with automatic failover:
- Environment variables
- User-provided keys
- Predefined backup keys

### Model Options
- **Gender**: Male, Female, Any
- **Age**: Young Adult, Adult, Mature
- **Watermark**: Custom text overlay

## 📁 Project Structure

```
src/
├── ai/flows/           # AI generation workflows
├── components/         # Reusable UI components
├── lib/               # Utility functions and configurations
├── hooks/             # Custom React hooks
└── app/               # Next.js app router pages
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Google Gemini AI for powerful image generation
- Shadcn/ui for beautiful UI components
- Next.js team for the amazing framework

## 📞 Contact

Abid Raza - [@abidraza5594](https://github.com/abidraza5594)

Project Link: [https://github.com/abidraza5594/Garmet-Image-Gen](https://github.com/abidraza5594/Garmet-Image-Gen)

---

⭐ Star this repo if you find it helpful!
