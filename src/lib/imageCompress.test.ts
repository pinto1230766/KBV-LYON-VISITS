/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { compressImage } from "./imageCompress";

// Mock HTMLImageElement with auto-firing onload when src is set
const mockImage: any = {
  width: 1000,
  height: 1000,
  onload: () => {},
  onerror: () => {},
  _src: "",
  get src() {
    return (this as any)._src;
  },
  set src(v: string) {
    (this as any)._src = v;
    // Fire onload asynchronously to mimic browser behavior
    queueMicrotask(() => (this as any).onload?.());
  },
};

const mockCanvas = {
  width: 0,
  height: 0,
  getContext: vi.fn(() => ({
    drawImage: vi.fn(),
  })),
  toDataURL: vi.fn((mimeType: string) => {
    if (mimeType === "image/webp") {
      return "data:image/webp;base64,WEBP_DATA";
    }
    return "data:image/jpeg;base64,JPEG_DATA";
  }),
};

const mockFileReader = {
  readAsDataURL: vi.fn(function (this: typeof mockFileReader) {
    queueMicrotask(() => this.onload?.());
  }),
  onload: (() => {}) as (() => void) | null,
  onerror: (() => {}) as ((e: unknown) => void) | null,
  result: "data:original;base64,ORIGINAL_DATA",
};

vi.stubGlobal("Image", function () { return mockImage as any; });
vi.stubGlobal("document", {
  createElement: vi.fn((tagName: string) => {
    if (tagName === "canvas") return mockCanvas as any;
    return {} as any;
  }),
});
vi.stubGlobal("FileReader", function () { return mockFileReader as any; });
vi.stubGlobal("URL", {
  createObjectURL: vi.fn(() => "blob:test-url"),
  revokeObjectURL: vi.fn(),
});

describe("compressImage", () => {
  const mockFile = new File(["dummy content"], "test.png", { type: "image/png" });

  beforeEach(() => {
    vi.clearAllMocks();
    mockCanvas.getContext.mockReturnValue({ drawImage: vi.fn() } as any);
    mockCanvas.toDataURL.mockImplementation((mimeType: string) => {
      if (mimeType === "image/webp") return "data:image/webp;base64,WEBP_DATA";
      return "data:image/jpeg;base64,JPEG_DATA";
    });
  });

  it("should compress image to WebP and downscale", async () => {
    const result = await compressImage(mockFile, { maxDim: 500, quality: 0.7 });

    expect((mockImage as any).src).toBe("blob:test-url");
    expect(mockCanvas.width).toBe(500);
    expect(mockCanvas.height).toBe(500);
    expect(mockCanvas.getContext).toHaveBeenCalledWith("2d");
    expect(mockCanvas.toDataURL).toHaveBeenCalledWith("image/webp", 0.7);
    expect(result).toBe("data:image/webp;base64,WEBP_DATA");
  });

  it("should fallback to JPEG if WebP is not supported or fails", async () => {
    mockCanvas.toDataURL.mockImplementationOnce(() => "data:image/jpeg;base64,JPEG_DATA");

    const result = await compressImage(mockFile);

    expect(mockCanvas.toDataURL).toHaveBeenCalledWith("image/webp", 0.82);
    expect(mockCanvas.toDataURL).toHaveBeenCalledWith("image/jpeg", 0.82);
    expect(result).toBe("data:image/jpeg;base64,JPEG_DATA");
  });

  it("should return original DataURL on compression error", async () => {
    mockCanvas.getContext.mockReturnValueOnce(null as any);

    const result = await compressImage(mockFile);

    expect(mockFileReader.readAsDataURL).toHaveBeenCalledWith(mockFile);
    expect(result).toBe("data:original;base64,ORIGINAL_DATA");
  });

  it("should use default options if none are provided", async () => {
    await compressImage(mockFile);
    expect(mockCanvas.width).toBe(800);
    expect(mockCanvas.height).toBe(800);
    expect(mockCanvas.toDataURL).toHaveBeenCalledWith("image/webp", 0.82);
  });
});
