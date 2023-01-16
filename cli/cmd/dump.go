package cmd

import (
	"cli/pkg/conn"
	"context"
	"encoding/json"
	"fmt"

	"github.com/spf13/cobra"
	"go.mongodb.org/mongo-driver/bson"
)

func dump(name string) error {
	client, err := conn.Setup()

	if err != nil {
		return err
	}

	dbname, err := conn.GetEnv("DB_NAME")
	if err != nil {
		return err
	}

	coll := client.Database(dbname).Collection(name)

	var result bson.M
	if err := coll.FindOne(context.TODO(), &bson.D{}).Decode(&result); err != nil {
		return err
	}

	jsonData, err := json.MarshalIndent(result, "", "	")
	if err != nil {
		return err
	}

	fmt.Printf("%s\n", jsonData)

	return nil
}

var dumpCmd = &cobra.Command{
	Use:   "dump [name]",
	Short: "Dump the sepcified collection",
	Args:  cobra.ExactArgs(1),
	RunE: func(cmd *cobra.Command, args []string) error {
		return dump(args[0])
	},
}

func init() {
	rootCmd.AddCommand(dumpCmd)
}
