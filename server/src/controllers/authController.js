import { getCurrentUser, loginUser, registerUser } from "../services/authService.js";

export async function register(req, res, next) {
  try {
    const user = await registerUser(req.body);
    res.status(201).json({
      success: true,
      message: "Registration successful",
      data: { user },
    });
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const result = await loginUser(req.body);
    res.status(200).json({
      success: true,
      message: "Login successful",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function me(req, res, next) {
  try {
    const user = await getCurrentUser(req.user.userId);
    res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
}

export async function studentOnly(req, res) {
  res.status(200).json({
    success: true,
    message: "Student access granted",
    data: {
      role: req.user.role,
    },
  });
}
