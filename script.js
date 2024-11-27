// app.js
document.getElementById('imageForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const fileInput = document.getElementById('imageInput');
    const operation = document.getElementById('operation').value;
    const originalCanvas = document.getElementById('originalCanvas');
    const resultCanvas = document.getElementById('resultCanvas');

    if (fileInput.files.length === 0) {
        alert('Please upload an image!');
        return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = function(event) {
        const img = new Image();
        img.src = event.target.result;

        img.onload = function() {
            const originalContext = originalCanvas.getContext('2d');
            const resultContext = resultCanvas.getContext('2d');

            originalCanvas.width = img.width;
            originalCanvas.height = img.height;
            resultCanvas.width = img.width;
            resultCanvas.height = img.height;

            originalContext.drawImage(img, 0, 0);

            // Get pixel data
            const imageData = originalContext.getImageData(0, 0, img.width, img.height);
            const transformedData = resultContext.createImageData(img.width, img.height);

            // Apply transformation
            if (operation === 'grayscale') {
                grayscaleTransform(imageData, transformedData);
            } else if (operation === 'blur') {
                blurTransform(imageData, transformedData, img.width, img.height);
            }

            resultContext.putImageData(transformedData, 0, 0);
        };
    };

    reader.readAsDataURL(file);
});

function grayscaleTransform(input, output) {
    for (let i = 0; i < input.data.length; i += 4) {
        const r = input.data[i];
        const g = input.data[i + 1];
        const b = input.data[i + 2];

        // Grayscale formula
        const avg = 0.3 * r + 0.59 * g + 0.11 * b;

        output.data[i] = output.data[i + 1] = output.data[i + 2] = avg; // RGB
        output.data[i + 3] = input.data[i + 3]; // Alpha
    }
}

function blurTransform(input, output, width, height) {
    const kernel = [1, 1, 1, 1, 1, 1, 1, 1, 1]; // Simple box blur kernel
    const kernelSize = 3;
    const kernelWeight = kernel.reduce((a, b) => a + b, 0);

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let r = 0, g = 0, b = 0, a = 0;

            for (let ky = -1; ky <= 1; ky++) {
                for (let kx = -1; kx <= 1; kx++) {
                    const px = Math.min(width - 1, Math.max(0, x + kx));
                    const py = Math.min(height - 1, Math.max(0, y + ky));
                    const index = (py * width + px) * 4;
                    const weight = kernel[(ky + 1) * kernelSize + (kx + 1)];

                    r += input.data[index] * weight;
                    g += input.data[index + 1] * weight;
                    b += input.data[index + 2] * weight;
                    a += input.data[index + 3];
                }
            }

            const index = (y * width + x) * 4;
            output.data[index] = r / kernelWeight;
            output.data[index + 1] = g / kernelWeight;
            output.data[index + 2] = b / kernelWeight;
            output.data[index + 3] = a / 9; // Alpha
        }
    }
}