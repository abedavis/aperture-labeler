import {
    ArrayEqualTo,
    ArrayCloseTo,
    MatrixEqual,
    VecEqual,
    VecCloseTo,
    VertexArray2DCircToBeCloseTo,
    VertexArray2DToBeCloseTo,
    MatrixCloseTo,
    QuaternionCloseToMatrix
} from "./helpers/TestHelpers";
expect.extend(ArrayEqualTo);
expect.extend(ArrayCloseTo);
expect.extend(VertexArray2DToBeCloseTo);
expect.extend(MatrixEqual);
expect.extend(MatrixCloseTo);
expect.extend(VecEqual);
expect.extend(VecCloseTo);
expect.extend(VertexArray2DCircToBeCloseTo);
expect.extend(QuaternionCloseToMatrix);


describe("My Test Set", () => {
    test("My Test 1", () => {
        expect(1).toBe(1);
    });
});

