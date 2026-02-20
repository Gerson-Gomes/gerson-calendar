package filemanager

import (
	"crypto/sha256"
	"fmt"
	"io"
	"os"
	"os/exec"
	"path/filepath"
	"time"

	"gerson-calendar/database"
)

type FileInfo struct {
	OriginalPath string `json:"originalPath"`
	StoredPath   string `json:"storedPath"`
	FileName     string `json:"fileName"`
}

func CopyFileToStorage(sourcePath string) (FileInfo, error) {
	var fileInfo FileInfo
	fileInfo.OriginalPath = sourcePath

	sourceFile, err := os.Open(sourcePath)
	if err != nil {
		return fileInfo, fmt.Errorf("failed to open source file: %w", err)
	}
	defer sourceFile.Close()

	filesDir, err := database.GetFilesDir()
	if err != nil {
		return fileInfo, err
	}

	originalFileName := filepath.Base(sourcePath)
	fileInfo.FileName = originalFileName

	timestamp := time.Now().Format("20060102_150405")

	hash := sha256.New()
	if _, err := io.Copy(hash, sourceFile); err != nil {
		return fileInfo, fmt.Errorf("failed to hash source file: %w", err)
	}
	hashStr := fmt.Sprintf("%x", hash.Sum(nil))[:8]

	if _, err := sourceFile.Seek(0, 0); err != nil {
		return fileInfo, fmt.Errorf("failed to seek source file: %w", err)
	}

	ext := filepath.Ext(originalFileName)
	nameWithoutExt := originalFileName[:len(originalFileName)-len(ext)]
	uniqueFileName := fmt.Sprintf("%s_%s_%s%s", nameWithoutExt, timestamp, hashStr, ext)

	destPath := filepath.Join(filesDir, uniqueFileName)

	destFile, err := os.Create(destPath)
	if err != nil {
		return fileInfo, fmt.Errorf("failed to create destination file: %w", err)
	}
	defer destFile.Close()

	if _, err = io.Copy(destFile, sourceFile); err != nil {
		os.Remove(destPath)
		return fileInfo, fmt.Errorf("failed to copy file: %w", err)
	}

	fileInfo.StoredPath = destPath
	return fileInfo, nil
}

func OpenFileWithDefaultApp(filePath string) error {
	if _, err := os.Stat(filePath); os.IsNotExist(err) {
		return fmt.Errorf("file does not exist: %s", filePath)
	}

	opener, err := exec.LookPath("xdg-open")
	if err != nil {
		return fmt.Errorf("xdg-open not found: %w", err)
	}

	cmd := exec.Command(opener, filePath)
	return cmd.Start()
}

func DeleteFile(filePath string) error {
	if filePath == "" {
		return nil
	}

	if _, err := os.Stat(filePath); os.IsNotExist(err) {
		return nil
	}

	if err := os.Remove(filePath); err != nil {
		return fmt.Errorf("failed to delete file: %w", err)
	}

	return nil
}
