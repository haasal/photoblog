package main

import (
	"context"
	"encoding/base64"
	"fmt"
	"io"
	"log"
	"os"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/joho/godotenv"
	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
)

var minioClient *minio.Client = nil

func getEnv(name string) string {
	env, ok := os.LookupEnv(name)
	if !ok {
		log.Fatalf("Environment variable %s not set!", name)
	}
	return env
}

func getMinioConnection() (*minio.Client, error) {
	// TODO: Add ssl
	if minioClient != nil {
		log.Println("Using cached minio client")
		return minioClient, nil
	}

	hostname := getEnv("BUCKET_ENDPOINT")
	port := getEnv("BUCKET_PORT")
	endpoint := fmt.Sprintf("%s:%s", hostname, port)
	accessKeyID := getEnv("BUCKET_ACCESS_KEY")
	secretAccessKey := getEnv("BUCKET_SECRET_KEY")

	return minio.New(endpoint, &minio.Options{
		Creds: credentials.NewStaticV4(accessKeyID, secretAccessKey, ""),
	})
}

func getFile(client *minio.Client, fileName string, bucketName string) (*minio.Object, error) {
	return client.GetObject(context.Background(), bucketName, fileName, minio.GetObjectOptions{})
}

func getFileResponse(file *minio.Object) (*events.APIGatewayProxyResponse, error) {
	buf, err := io.ReadAll(file)
	if err != nil {
		return nil, fmt.Errorf("failed to read file: %s", err)
	}

	encodedBuf := base64.StdEncoding.EncodeToString(buf)

	return &events.APIGatewayProxyResponse{
		StatusCode:      200,
		Body:            encodedBuf,
		IsBase64Encoded: true,
	}, nil
}

func handler(r events.APIGatewayProxyRequest) (*events.APIGatewayProxyResponse, error) {
	godotenv.Load("../../.env")

	minioClient, err := getMinioConnection()

	if err != nil {
		log.Fatalln(err)
	}

	// fileName := r.URL.Path[len("/api/files/"):]
	fileName := "psylo.jpg"
	bucketName := getEnv("BUCKET_NAME")

	file, err := getFile(minioClient, fileName, bucketName)
	// TODO: Proper error handling
	if err != nil {
		log.Fatalln(err)
	}
	defer file.Close()

	return getFileResponse(file)
}

func main() {
	lambda.Start(handler)
}
