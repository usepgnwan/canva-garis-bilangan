import { useFeatureSupport } from "@canva/app-hooks";
import { upload, requestFontSelection } from "@canva/asset";
import { addElementAtPoint, initAppElement } from "@canva/design";
import { act, fireEvent, screen } from "@testing-library/react";
import React from "react";
import { App } from "src/intents/design_editor/app";
import { renderInTestProvider } from "src/utils/test_render";
import * as styles from "styles/components.css";
import { resetAppElementClientForTesting } from "src/canva_bridge";

const MSG_ADD = "Tambahkan ke desain";
const MSG_UPDATE = "Perbarui garis bilangan";
const MSG_EDITING_ALERT = "Anda sedang mengedit garis bilangan yang dipilih di kanvas.";
const MSG_CHOOSE_FONT = "Pilih Font dari Canva...";
const MSG_SETTINGS = "Pengaturan Tampilan";

let elementChangeHandler: ((el: any) => void) | null = null;
const mockAddElement = jest.fn();
const mockUpdate = jest.fn();

jest.mock("@canva/app-hooks");
jest.mock("@canva/asset", () => ({
  upload: jest.fn().mockResolvedValue({ ref: "mock_image_ref_1" }),
  requestFontSelection: jest.fn().mockResolvedValue({
    type: "completed",
    font: { ref: "mock_font_ref_canva", name: "Caveat" },
  }),
}));

jest.mock("@canva/design", () => ({
  initAppElement: jest.fn(() => ({
    addElement: mockAddElement,
    registerOnElementChange: jest.fn((handler) => {
      elementChangeHandler = handler;
      return () => {
        elementChangeHandler = null;
      };
    }),
  })),
  addElementAtPoint: jest.fn(),
  addElementAtCursor: jest.fn(),
}));

describe("MathLine App Element & UI Tests", () => {
  const mockIsSupported = jest.fn();
  const mockUseFeatureSupport = jest.mocked(useFeatureSupport);

  beforeEach(() => {
    jest.clearAllMocks();
    resetAppElementClientForTesting();
    elementChangeHandler = null;
    mockIsSupported.mockReturnValue(true);
    mockUseFeatureSupport.mockReturnValue(mockIsSupported);
    (upload as jest.Mock).mockResolvedValue({ ref: "mock_image_ref_1" });
  });

  it("menambahkan garis bilangan sebagai app element", async () => {
    renderInTestProvider(<App />);

    const addButton = screen.getByRole("button", {
      name: MSG_ADD,
    });
    expect(addButton.hasAttribute("disabled")).toBe(false);

    await act(async () => {
      fireEvent.click(addButton);
    });

    expect(upload).toHaveBeenCalled();
    expect(mockAddElement).toHaveBeenCalledTimes(1);
    const callArgs = mockAddElement.mock.calls[0][0];
    expect(callArgs.data).toBeDefined();
    expect(callArgs.data.topic).toBe("integers_ops");
    expect(callArgs.data.input).toBe("-3 + 5");
    expect(callArgs.data.imageRef).toBe("mock_image_ref_1");
  });

  it("memuat & memperbarui garis bilangan yang dipilih di desain", async () => {
    renderInTestProvider(<App />);

    expect(elementChangeHandler).toBeDefined();

    // Simulate clicking an element on canvas
    const mockElement = {
      data: {
        version: 2,
        topic: "linear_eq",
        input: "2x - 3 = 7",
        imageRef: "canvas_existing_image_ref",
        width: 800,
        height: 360,
        settings: {
          topic: "linear_eq",
          autoScale: true,
          manualMin: -10,
          manualMax: 10,
          manualStep: 1,
          solutionColor: "#3B82F6",
          axisColor: "#333333",
          backgroundMode: "white",
          backgroundColor: "#FFFFFF",
          fontFamily: "Arial, sans-serif",
          showSteps: true,
          showLabels: true,
          showTitle: true,
          universe: "real",
          worksheetMode: false,
        },
      },
      update: mockUpdate,
    };

    await act(async () => {
      elementChangeHandler!(mockElement);
    });

    // Alert editing should be visible
    expect(
      screen.queryByText(MSG_EDITING_ALERT)
    ).toBeTruthy();

    // Update button should appear and be enabled
    const updateButton = screen.getByRole("button", {
      name: MSG_UPDATE,
    });
    expect(updateButton.hasAttribute("disabled")).toBe(false);

    // Click update button
    (upload as jest.Mock).mockResolvedValue({ ref: "mock_updated_image_ref" });

    await act(async () => {
      fireEvent.click(updateButton);
    });

    expect(upload).toHaveBeenCalled();
    expect(mockUpdate).toHaveBeenCalledTimes(1);
    const updateArgs = mockUpdate.mock.calls[0][0];
    expect(updateArgs.data.imageRef).toBe("mock_updated_image_ref");
  });

  it("setelah ditambahkan, elemen baru langsung bisa diperbarui", async () => {
    renderInTestProvider(<App />);

    const addButton = screen.getByRole("button", {
      name: MSG_ADD,
    });
    await act(async () => {
      fireEvent.click(addButton);
    });

    // Canva triggers selection of newly added element
    const newElement = {
      data: {
        version: 2,
        topic: "integers_ops",
        input: "-3 + 5",
        imageRef: "mock_image_ref_1",
        width: 800,
        height: 360,
        settings: {
          topic: "integers_ops",
        },
      },
      update: mockUpdate,
    };

    await act(async () => {
      elementChangeHandler!(newElement);
    });

    expect(
      screen.queryByRole("button", {
        name: MSG_UPDATE,
      })
    ).toBeTruthy();
  });

  it("klik gambar di kanvas -> tombol Update aktif; klik di luar -> kembali ke Add to design", async () => {
    renderInTestProvider(<App />);

    const selectedElement = {
      data: {
        version: 2,
        topic: "integers_ops",
        input: "-3 + 5",
        imageRef: "elem_ref_456",
        width: 800,
        height: 360,
      },
      update: mockUpdate,
    };

    // 1. Click element in canvas
    await act(async () => {
      elementChangeHandler!(selectedElement);
    });
    expect(
      screen.queryByRole("button", {
        name: MSG_UPDATE,
      })
    ).toBeTruthy();

    // 2. Click outside (deselect)
    await act(async () => {
      elementChangeHandler!(null);
    });
    expect(
      screen.queryByRole("button", {
        name: MSG_ADD,
      })
    ).toBeTruthy();
  });

  it("pratinjau tidak bisa diseret", () => {
    const { container } = renderInTestProvider(<App />);
    const previewSvg = container.querySelector(`.${styles.previewSvg}`);
    expect(previewSvg).toBeTruthy();
    expect(previewSvg?.getAttribute("draggable")).toBe("false");
  });

  it("jenis desain tanpa app element: fallback ke gambar biasa", async () => {
    // Simulate environment where initAppElement is not supported by current design type
    mockIsSupported.mockImplementation(
      (fn) => fn !== initAppElement && fn === addElementAtPoint
    );

    renderInTestProvider(<App />);
    const addButton = screen.getByRole("button", {
      name: MSG_ADD,
    });

    await act(async () => {
      fireEvent.click(addButton);
    });

    expect(upload).toHaveBeenCalled();
    expect(addElementAtPoint).toHaveBeenCalled();
  });

  it("uji font Canva, warna latar, dan bilangan bulat yang menyimpan topic ke data app element", async () => {
    renderInTestProvider(<App />);

    // Open Settings accordion
    const settingsHeader = screen.getByRole("button", {
      name: MSG_SETTINGS,
    });
    await act(async () => {
      fireEvent.click(settingsHeader);
    });

    // Choose font from Canva
    const chooseFontBtn = screen.getByRole("button", {
      name: MSG_CHOOSE_FONT,
    });
    await act(async () => {
      fireEvent.click(chooseFontBtn);
    });

    expect(requestFontSelection).toHaveBeenCalled();

    // Add to design
    const addButton = screen.getByRole("button", {
      name: MSG_ADD,
    });
    await act(async () => {
      fireEvent.click(addButton);
    });

    const addedData = mockAddElement.mock.calls[0][0].data;
    expect(addedData.topic).toBe("integers_ops");
    expect(addedData.canvaFontRef).toBe("mock_font_ref_canva");
    expect(addedData.textBoxes).toBeDefined();
    expect(addedData.textBoxes.length).toBeGreaterThan(0);
  });
});
