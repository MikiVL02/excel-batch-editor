from PIL import Image as PILImage
img = PILImage.new("RGB", (100, 100), color=(255, 0, 0))
img.save("tests/fixtures/sample_image.png")
print("image fixture created")
