package conn

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func fatal(err error) {
	if err != nil {
		log.Fatalln(err)
	}
}

func GetEnv(env string) (string, error) {
	if value, ok := os.LookupEnv(env); !ok {
		return "", fmt.Errorf("environment variable \"%s\" not declared", env)
	} else {
		return value, nil
	}
}

func HandleDissconnect(client *mongo.Client) {
	if err := client.Disconnect(context.TODO()); err != nil {
		panic(err)
	}
}

func ConnectDB(uri string) (*mongo.Client, error) {
	serverAPIOptions := options.ServerAPI(options.ServerAPIVersion1)
	clientOptions := options.Client().
		ApplyURI(uri).
		SetServerAPIOptions(serverAPIOptions)

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	client, err := mongo.Connect(ctx, clientOptions)

	return client, err
}

func Setup() (*mongo.Client, error) {
	uri, err := GetEnv("DB_URI")
	if err != nil {
		return nil, err
	}

	client, err := ConnectDB(uri)
	if err != nil {
		return nil, err
	}

	return client, nil
}
