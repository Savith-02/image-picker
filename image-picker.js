class Thumbnail {
  constructor(image, index) {
    // console.log(`Creating thumbnail for image: ${image.name}, index: ${index}`);
    this.image = image;
    this.index = index;
    this.element = document.createElement("div");
    this.element.className = "thumbnail";
    this.element.innerHTML = `
      <img src="${image.src}" alt="${image.name}">
      <div class="cross" onclick="imagePicker.removeImage(${index})">X</div>`;
  }

  getElement() {
    return this.element;
  }
}

class ImagePicker {
  constructor(
    duplicatePolicy = { type: "none", max: 1 },
    style = "app",
    theme = {}
  ) {
    console.log("Initializing ImagePicker");
    console.log(`Duplicate policy: ${JSON.stringify(duplicatePolicy)}`);
    // console.log(`Style: ${style}`);
    // console.log(`Theme: ${JSON.stringify(theme)}`);
    this.images = [];
    this.duplicatePolicy = duplicatePolicy;
    this.style = style;
    this.theme = theme;
    this.imagePickerElement = document.getElementById("imagePicker");
    this.thumbnailsElement = document.getElementById("thumbnails");
    this.imageInput = document.getElementById("imageInput");
    this.downloadBtn = document.getElementById("downloadBtn");
    this.alertManager = new AlertManager();

    this.applyTheme();
    this.applyStyle();

    this.imagePickerElement.addEventListener("click", (event) => {
      if (event.detail !== 1) return; // Check for single left click (detail property)
      // this.handleImageSelection(event.target.files);
      this.imageInput.click(); // Trigger the file picker
      this.imageInput.disabled = true; // Disable the input field
      // event.preventDefault();
      // event.stopPropagation(); // Uncomment if necessary
      console.log("Image picker clicked");
    });
    this.imageInput.addEventListener("cancel", function () {
      console.log("Element was cancelled");
      if (imageInput.disabled) {
        imageInput.disabled = false;
      }
    });
    this.imageInput.addEventListener("change", (e) => {
      console.log("Image input changed");
      this.handleImageSelection(e.target.files);
      // Reset the input value to ensure the change event fires even if the same file is selected again
      e.target.value = "";
      this.imageInput.disabled = false;
    });
    this.downloadBtn.addEventListener("click", () => {
      console.log("Download button clicked");
      this.downloadImages();
    });

    // Drag and Drop
    ["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
      this.imagePickerElement.addEventListener(
        eventName,
        (e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log(`Event: ${eventName}`);
        },
        false
      );
    });

    ["dragenter", "dragover"].forEach((eventName) => {
      this.imagePickerElement.addEventListener(
        eventName,
        () => {
          // console.log(`Drag enter/over event: ${eventName}`);
          this.imagePickerElement.classList.add("active");
        },
        false
      );
    });

    ["dragleave", "drop"].forEach((eventName) => {
      this.imagePickerElement.addEventListener(
        eventName,
        () => {
          // console.log(`Drag leave/drop event: ${eventName}`);
          this.imagePickerElement.classList.remove("active");
        },
        false
      );
    });

    this.imagePickerElement.addEventListener("drop", (e) => {
      // console.log("Images dropped");
      this.handleImageSelection(e.dataTransfer.files);
    });
  }

  applyTheme() {
    // console.log("Applying theme");
    const root = document.documentElement;
    Object.keys(this.theme).forEach((key) => {
      root.style.setProperty(`--${key}`, this.theme[key]);
      // console.log(`Applied theme property: --${key}: ${this.theme[key]}`);
    });
  }

  applyStyle() {
    // console.log(`Applying style: ${this.style}`);
    this.imagePickerElement.classList.add(this.style);
  }

  showLoadingScreen() {
    document.getElementById("loadingScreen").style.display = "flex";
  }
  hideLoadingScreen() {
    document.getElementById("loadingScreen").style.display = "none";
  }

  handleImageSelection(files) {
    console.log("Handling image selection");
    if (files.length > 1) {
      console.log("Showing loading screen");
      this.showLoadingScreen();
    }

    const handleImage = (file) => {
      // console.log(`File selected: ${file.name}`);
      if (this.validateImage(file)) {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            const imageObject = { src: e.target.result, name: file.name };
            // console.log(`Image loaded: ${imageObject.name}`);
            if (this.canAddImage(imageObject)) {
              // console.log("Image can be added");
              this.images.push(imageObject);
              this.displayImages();
              this.showSuccess();
              resolve(true);
            } else {
              console.log("Duplicate image detected");
              this.alertManager.show("Duplicate image not allowed!", "error");
              resolve(false);
            }
          };
          reader.readAsDataURL(file);
        });
      } else {
        console.log("Invalid file type");
        this.alertManager.show(
          "Invalid file type. Only images are allowed",
          "info"
        );
        return Promise.resolve(false);
      }
    };

    // Convert FileList to Array
    const fileList = Array.from(files);

    Promise.all(fileList.map((file) => handleImage(file)))
      .then((results) => {
        if (fileList.length > 1) {
          console.log("Hiding loading screen");
          this.hideLoadingScreen();
        }
      })
      .catch((error) => {
        console.error("Error handling image selection:", error);
        if (fileList.length > 1) {
          console.log("Hiding loading screen due to error");
          this.hideLoadingScreen();
        }
      });
    this.imageInput.disabled = false;
    console.log("Image input enabled");
  }

  validateImage(file) {
    // console.log(`Validating image: ${file.name}`);
    return file.type.startsWith("image/");
  }

  canAddImage(image) {
    console.log(`Checking if image can be added: ${image.name}`);
    switch (this.duplicatePolicy.type) {
      case "none": {
        const isDuplicate = this.images.some((img) => img.src === image.src);
        console.log(`Is duplicate: ${isDuplicate}`);
        return !isDuplicate;
      }
      case "limited":
        const count = this.images.filter((img) => img.src === image.src).length;
        console.log(`Image count: ${count}`);
        return count < this.duplicatePolicy.max;
      case "no-consecutive":
        const isConsecutive =
          this.images.length > 0 &&
          this.images[this.images.length - 1].src === image.src;
        console.log(`Is consecutive: ${isConsecutive}`);
        return !isConsecutive;
      default:
        return true;
    }
  }

  displayImages() {
    // console.log("Displaying images");
    this.thumbnailsElement.innerHTML = "";
    this.images.forEach((image, index) => {
      const thumbnail = new Thumbnail(image, index);
      this.thumbnailsElement.appendChild(thumbnail.getElement());
      // console.log(`Thumbnail added for image: ${image.name}`);
    });
  }

  removeImage(index) {
    console.log(`Removing image at index: ${index}`);
    this.images.splice(index, 1);
    this.displayImages();
  }

  showSuccess() {
    // console.log("Showing success indicator");
    this.imagePickerElement.classList.add("success");
    setTimeout(() => {
      // console.log("Hiding success indicator");
      this.imagePickerElement.classList.remove("success");
    }, 1000);
    this.alertManager.show("Image added!", "success");
  }

  downloadImages() {
    console.log("Download functionality to be implemented");
    // Implementation for downloading images as a zip goes here.
    // This could involve using a library like JSZip and triggering a download.
  }
}

// Custom default theme
const defaultTheme = {
  "background-color": "#f0f0f0",
  "primary-color": "#2a9d8f",
  "secondary-color": "#264653",
  "text-color": "#000",
  // "alert-error-bg": "#e76f51",
  // "alert-success-bg": "#2a9d8f",
};

// Instantiate the ImagePicker with style and theme parameters
const imagePicker = new ImagePicker(
  { type: "limited", max: 4 },
  "app",
  defaultTheme
);
