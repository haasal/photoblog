/*
Copyright © 2023 NAME HERE <EMAIL ADDRESS>
*/
package cmd

import (
	"cli/pkg/conn"
	"context"

	"github.com/spf13/cobra"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func getSelectedImages(images *mongo.Collection, imageTitles []string) ([]bson.M, error) {
	imageTitlesBson := bson.A{}
	for _, title := range imageTitles {
		imageTitlesBson = append(imageTitlesBson, title)
	}

	projection := bson.D{{"title", 1}}
	filter := bson.D{{"title", bson.D{{"$in", imageTitlesBson}}}}

	cur, err := images.Find(context.TODO(), filter, options.Find().SetProjection(projection))
	if err != nil {
		return nil, err
	}

	var result []bson.M
	if err := cur.All(context.TODO(), &result); err != nil {
		return nil, err
	}

	return result, nil
}

func createSeries(imageTitles []string, title string, descr string, private bool, password string) error {
	client, err := conn.Setup()
	if err != nil {
		return err
	}

	dbname, err := conn.GetEnv("DB_NAME")
	if err != nil {
		return err
	}

	images := client.Database(dbname).Collection("images")
	series := client.Database(dbname).Collection("series")

	selectedImages, err := getSelectedImages(images, imageTitles)
	if err != nil {
		return err
	}

	newSerie := bson.D{
		{"title", title},
		{"descr", descr},
		{"private", private},
		{"images", selectedImages},
	}

	if private {
		newSerie = append(newSerie, bson.E{"password", password})
	}

	if _, err := series.InsertOne(context.TODO(), newSerie); err != nil {
		return err
	}

	return nil
}

func init() {
	var title string
	var descr string
	var private bool
	var password string

	var createSeriesCmd = &cobra.Command{
		Use:   "createSeries [...images]",
		Short: "Create a series from specified images",
		Args:  cobra.MinimumNArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			return createSeries(args, title, descr, private, password)
		},
	}

	rootCmd.AddCommand(createSeriesCmd)

	createSeriesCmd.Flags().StringVarP(&title, "title", "t", "", "Title of the serie")
	createSeriesCmd.MarkFlagRequired("title")
	createSeriesCmd.Flags().StringVarP(&descr, "descr", "d", "", "A Description of the serie")
	createSeriesCmd.Flags().BoolVar(&private, "private", false, "Sets the serie as private")
	createSeriesCmd.Flags().StringVarP(&password, "password", "p", "", "The collection password")
	createSeriesCmd.MarkFlagsRequiredTogether("private", "password")
}
