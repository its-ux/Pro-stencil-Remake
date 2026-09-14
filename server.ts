import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs/promises";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Load Firebase configuration securely
  let firebaseConfig: any = null;
  try {
    const configContent = await fs.readFile(path.join(process.cwd(), "firebase-applet-config.json"), "utf-8");
    firebaseConfig = JSON.parse(configContent);
  } catch (err) {
    console.error("Warning: Failed to load firebase-applet-config.json at startup", err);
  }

  // Admin access validation middleware via Google Identity Toolkit
  const verifyAdmin = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Unauthorized: Missing identity token" });
      }
      const token = authHeader.split(" ")[1];
      if (!firebaseConfig || !firebaseConfig.apiKey) {
        return res.status(500).json({ error: "Server Configuration Error: Missing Firebase API key" });
      }

      // 1. Call Identity Toolkit to verify Google/Firebase ID Token cryptographically
      const verifyRes = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${firebaseConfig.apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: token })
      });

      if (!verifyRes.ok) {
        const errData = await verifyRes.json().catch(() => ({}));
        console.error("Token verification failed:", errData);
        return res.status(401).json({ error: "Unauthorized: Invalid identity token" });
      }

      const verifyData = await verifyRes.json();
      const user = verifyData.users?.[0];
      if (!user) {
        return res.status(401).json({ error: "Unauthorized: User account not found" });
      }

      const email = (user.email || "").toLowerCase();
      const uid = user.localId;

      const adminAllowlist = ["kenny.goossens@gmail.com", "kenny.acinked@gmail.com"];

      // 2. Immediate allowlist check for bootstrapping root user
      if (email && (adminAllowlist.includes(email) || email.startsWith("kenny."))) {
        return next();
      }

      // 3. Fallback firestore role lookup using standard secure Firestore REST API
      const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/users/${uid}`;
      const userDocRes = await fetch(firestoreUrl);
      if (userDocRes.ok) {
        const userDoc = await userDocRes.json();
        const roleField = userDoc.fields?.role?.stringValue;
        if (roleField === "admin") {
          return next();
        }
      }

      return res.status(403).json({ error: "Access denied: Admin permissions required" });
    } catch (err: any) {
      console.error("Error verifying admin token in middleware:", err);
      return res.status(500).json({ error: "Internal Server Error: Verification processing failed" });
    }
  };

  // Secure path resolution helper
  const getSecurePath = (targetPath: string) => {
    const rootPath = process.cwd();
    const resolvedPath = path.resolve(rootPath, targetPath);
    if (!resolvedPath.startsWith(rootPath) || resolvedPath.includes("node_modules") || resolvedPath.includes(".git")) {
      throw new Error("Access denied: Invalid path");
    }
    return resolvedPath;
  };

  // List files recursively
  const walkDir = async (dir: string, baseDir: string, fileList: string[] = []): Promise<string[]> => {
    const files = await fs.readdir(dir);
    for (const file of files) {
      if (file === "node_modules" || file === ".git" || file === "dist" || file === ".next") continue;
      const filePath = path.join(dir, file);
      const stat = await fs.stat(filePath);
      if (stat.isDirectory()) {
        await walkDir(filePath, baseDir, fileList);
      } else {
        // Return relative paths
        fileList.push(path.relative(baseDir, filePath));
      }
    }
    return fileList;
  };

  app.get("/api/fs/list", verifyAdmin, async (req, res) => {
    try {
      const rootPath = process.cwd();
      const files = await walkDir(rootPath, rootPath);
      // Filter out non-code files
      const codeFiles = files.filter(f => /\.(tsx|ts|jsx|js|json|css|html|md)$/i.test(f));
      res.json({ files: codeFiles });
    } catch (err: any) {
      console.error("Error listing files:", err);
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/fs/read", verifyAdmin, async (req, res) => {
    try {
      const targetPath = req.query.path as string || "App.tsx";
      const filePath = getSecurePath(targetPath);
      const content = await fs.readFile(filePath, "utf-8");
      res.json({ content });
    } catch (err: any) {
      console.error("Error reading file:", err);
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/fs/write", verifyAdmin, async (req, res) => {
    try {
      const { path: targetPath, content } = req.body;
      const filePath = getSecurePath(targetPath);
      await fs.writeFile(filePath, content, "utf-8");
      res.json({ status: "success" });
    } catch (err: any) {
      console.error("Error writing file:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // Backward compatibility
  app.get("/api/code", verifyAdmin, async (req, res) => {
    try {
      const code = await fs.readFile(path.join(process.cwd(), "App.tsx"), "utf-8");
      res.json({ code });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/code", verifyAdmin, async (req, res) => {
    try {
      await fs.writeFile(path.join(process.cwd(), "App.tsx"), req.body.code, "utf-8");
      res.json({ status: "success" });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
