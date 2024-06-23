# DNS Speed Test

DNS Speed Test is a local application that helps users find the fastest DNS server for their network. By testing multiple DNS servers and domains, it provides comprehensive results to optimize internet performance.

## Features

- Test multiple DNS servers simultaneously
- Compare DNS response times for various domains
- Measure download speeds using different DNS servers
- Analyze ping spikes and packet loss
- Interactive charts for easy result interpretation
- Export test results for further analysis

## Getting Started

### Prerequisites

- For Windows: Windows 10 version 1709 (build 16299) or later with [Windows Package Manager (winget)](https://docs.microsoft.com/en-us/windows/package-manager/winget/)
- For macOS: [Homebrew](https://brew.sh/) (will be installed automatically if not present)
- For Linux: sudo privileges (for package installation)

### Installation and Setup

1. Navigate to the [GitHub releases page](https://github.com/Renjirox/dns-speed-test/releases/tag/v1.0.0) of this project.
2. Download the appropriate script file for your operating system:

   - For Windows: `setup_and_run.bat`
   - For macOS/Linux: `setup_and_run.sh`

3. Run the script:

   - On Windows:

     - Double-click the `setup_and_run.bat` file.
     - If prompted by Windows Defender or your antivirus, allow the script to run.
     - Follow any on-screen prompts to install Git and Node.js if they're not already present.

   - On macOS/Linux:
     - Open a terminal in the directory where you downloaded the script.
     - Make the script executable by running: `chmod +x setup_and_run.sh`
     - Run the script with: `./setup_and_run.sh`
     - You may be prompted for your password to install necessary packages.

4. The script will automatically:

   - Install Git and Node.js if they're not already installed
   - Clone the DNS Speed Test repository
   - Install project dependencies
   - Start the application
   - Open your default web browser to the application (http://localhost:3000)

5. Once the application is running in your browser, you can start using the DNS Speed Test tool!

6. To stop the application:
   - On Windows: Press any key in the command prompt window that opened when you ran the script.
   - On macOS/Linux: Press Ctrl+C in the terminal where you ran the script.

## Usage

1. Enter the DNS servers you want to test
2. Add or remove domains to test against
3. Configure the number of tests and other settings
4. Click "Run Tests" to start the DNS speed test
5. View the results in the interactive charts and detailed breakdown
6. Export results for further analysis if needed

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License. This means:

- You are free to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the software.
- You must include the copyright notice and the license notice in all copies or substantial portions of the software.
- The software is provided "as is", without warranty of any kind.

For more details, see the [LICENSE](LICENSE) file in the project repository.

The MIT License is a permissive license that is short and to the point. It lets people do almost anything they want with your project, like making and distributing closed source versions, as long as they provide attribution back to you and don't hold you liable.

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [React](https://reactjs.org/)
- [Chart.js](https://www.chartjs.org/)
- [Lucide Icons](https://lucide.dev/)
- [shadcn/ui](https://ui.shadcn.com/)

## Contact

If you have any questions or suggestions, please open an issue on this repository.
