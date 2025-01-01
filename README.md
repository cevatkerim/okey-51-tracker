# Okey51 Score Tracker

A responsive web application for tracking scores in Okey 51 games. Built with React, TypeScript, and shadcn/ui.
![image](https://github.com/user-attachments/assets/c508e03f-77ef-4a31-a5f7-a294f687e690)
![image](https://github.com/user-attachments/assets/49c3dcec-5997-4127-b9da-f82bd06b6d59)

## Features

- 🎮 Track scores for multiple players in real-time
- 📊 Round-by-round score tracking with expandable history
- 🏆 Automatic winner calculation (lowest score wins)
- 🎯 End game celebration with confetti animation
- 🔄 New game functionality with complete state reset
- 💾 Persistent storage using localStorage
- 📱 Fully responsive design
- 🌓 Modern UI with beautiful animations

## Core Functionality

- **Player Management**
  - Add/remove players before game starts
  - Edit player names at any time
  - Minimum of 2 players required

- **Score Tracking**
  - Add positive or negative scores for each player
  - Remove last entered score
  - View round totals and grand totals
  - Expandable round history

- **Game Flow**
  - Start new rounds
  - End game to see winner and rankings
  - Start new game with fresh state

## Technical Stack

- React 18
- TypeScript
- Tailwind CSS
- Vite
- Playwright for E2E testing

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run tests
npm run test
```

## Deployment

The application is containerized and can be deployed using Docker:

```bash
# Build Docker image
docker build -t okey-tracker:1.0 .

# Run container
docker run -p 80:80 okey-tracker:1.0
```

## Kubernetes Deployment

The application can be deployed to Kubernetes using the provided manifests in `k8s/deployment.yaml`. The deployment includes:

- Service configuration
- Ingress setup with TLS
- Deployment configuration with resource limits
- Certificate management

## Environment Variables

No environment variables are required as the application uses client-side storage only.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
